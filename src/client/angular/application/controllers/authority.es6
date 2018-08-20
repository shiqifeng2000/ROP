/**
 * Created by zhangjj on 21/02/2017.
 */
define([], function () {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog', ($rootScope, $scope, $q, $http, $mdDialog) => {
    $scope.reset = () => {
      $scope.columns = [
        {text: '开发者名称', name: 'user_name'},
        {text: '状态', name: 'status_name', style: {width: '96px', 'text-align': 'center'}},
        {text: '添加时间', name: 'create_time', style: {width: '160px', 'text-align': 'center'}}]
      $scope.keyword = ''
      $scope.batch = false
      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
    }
    $scope.reset()

    $scope.searcher = (index, size) => {
      $scope.refreshing = true
      var previous = $scope.tableData && $scope.tableData._select
      return $scope.ajax('list', {
        pageindex: index || $scope.pageIndex,
        pagesize: size || $scope.pageSize,
        isv_user_name: $scope.keyword
      }, (data) => {
        if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
          $scope.tableData = data.data_list
          $scope.total = data.list_count
          if ($scope.tableData && $scope.tableData[0]) {
            if (previous) {
              $scope.tableData._select = [].concat.apply([], $scope.tableData.map(r => ((previous.user_id == r.user_id) ? [r] : [])))[0]
            } else {
              $scope.tableData._select = $scope.tableData[0]
            }
          }
        } else {
          $rootScope.alert(data.msg)
          $scope.total = 0
        }
      }, () => {
        $scope.total = 0
      }).finally(() => {
        $scope.refreshing = false
      })
    }
    $scope.tableData = []
    $scope.research = () => {
      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
    }

    $scope.canOperate = () => ($scope.tableData._select);

    let IsvAppenderController = (scope, user_list) => {
      scope.original_user_list = user_list
      scope.user_list = user_list
      scope.columns = [{
        text: '开发者名称',
        name: 'user_name',
        style: {'text-align': 'center', 'width': '328px'}
      }]
      scope.multiple = true
      scope.filter = () => {
        let candidateList = [].concat.apply([], scope.user_list.map((r, i) => {
          if (scope.keyword && (r.user_name.indexOf(scope.keyword) != -1)) {
            r._highlight = true
            return [i]
          } else {
            r._highlight = false
            return []
          }
        })), index = candidateList[0]
        scope.index = index
      }

      scope.filterNext = (e) => {
        e.preventDefault()
        e.stopPropagation()
        let candidateList = [].concat.apply([], scope.user_list.map((r, i) => {
          if (r.user_name.indexOf(scope.keyword) != -1) {
            return [i]
          } else {
            return []
          }
        })), index = candidateList[0]
        for (var i = 0; i < candidateList.length; i++) {
          if (candidateList[i] > scope.index) {
            index = candidateList[i]
            break
          }
        }
        scope.index = index
      }
      scope.save = () => {
        if (scope.refreshing) {return}
        let list = [].concat.apply([], scope.user_list.map((r, i) => {return r._checked ? [{user_id: r.user_id}] : []}))
        if (!list.length) {
          scope.error = '请选择至少一位开发者进行添加'
          return
        }
        scope.refreshing = true
        return $http.post('/agent', {
          module: 'application',
          partial: 'authority',
          api: 'save',
          param: {
            user_list: list
          }
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            scope.close().then($scope.reset)
            return body.data
          } else {
            scope.error = body.data.msg
            return $q.reject(body.data.msg)
          }
        }, why => {
          scope.error = why
          return $q.reject(why)
        }).finally(() => {scope.refreshing = false})
      }
      scope.close = () => $mdDialog.hide()
    }

    // Bug ROP641 添加删除提示信息
    $scope.deleteUser = (row) => {
      return $rootScope.confirm('请确认是否要删除开发者？', () => {
        return $scope.ajax('delete', {user_list: [$scope.tableData._select]}, (data) => {
          $rootScope.warn('删除成功', 1);
          $scope.research()
        })
      })
    }

    $scope.appender = (ev, api) => {
      if ($scope.refreshing) {return}
      $scope.refreshing = true
      return $scope.ajax('candidates', {
        pageindex: 1,
        pagesize: 999,
      }, (data) => {
        if (data.data_list && data.data_list.length) {
          $mdDialog.show({
            controller: IsvAppenderController,
            template: `
              <md-dialog aria-label="添加开发者" class="reminder" aria-describedby="reminder" id="{{dialogId}}">
                  <md-toolbar>
                      <div class="md-toolbar-tools">
                          <h3><span>添加开发者</span></h3>
                          <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                              <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                          </md-button>
                      </div>
                  </md-toolbar>
              
                  <md-dialog-content>
                      <div class="md-dialog-content" >
                          <form class="search-wrapper" ng-submit="filterNext($event)">
                              <div class="search-group">
                                  <button type="submit">
                                      <md-icon class="md-primary" md-svg-icon="action:ic_search_24px" ng-click="filterNext($vent)"></md-icon>
                                  </button>
                                  <input type="text" class="searcher" ng-model="keyword" placeholder="请输入关键字......" ng-change="filter()"/>
                              </div>
                          </form>
                          <div class="table-wrapper">
                              <rop-fixed-table cols="columns" data="user_list" cursor="index" keyword="keyword" multiple="multiple"/>
                              <div class="app-loading" ng-if="refreshing">
                                  <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                              </div>
                          </div>
                      </div>
                  </md-dialog-content>
                  
                  <md-dialog-actions layout="row">
                      <div class="message" ng-if="error">
                          <span ng-bind="error"></span>
                      </div>
                    <md-button ng-click="save()">添加</md-button>
                  </md-dialog-actions>
              </md-dialog>
          `,
            autoWrap: false,
            targetEvent: ev,
            clickOutsideToClose: true,
            parent: angular.element(document.querySelector('body>section>md-content')),
            locals: {user_list: data.data_list}
          })
        } else {
          $rootScope.alert('尚未有任何开发者')
        }
      }).finally(() => {$scope.refreshing = false})
    }


    window.test = $scope
  }]
})
