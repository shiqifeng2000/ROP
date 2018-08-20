/**
 * Created by zhangjj on 11/04/2017.
 */
define(['../../services'], function () {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog',
    ($rootScope, $scope, $q, $http, $mdDialog) => {
      $scope.reset = () => {
        $scope.columns = [
          {text: '开发者名称', name: 'user_name'},
          {text: '公司名称', name: 'company', style: {width: '320px', 'text-align': 'center'}},
          {text: '部门名称', name: 'department', style: {width: '320px', 'text-align': 'center'}},
          {text: '添加时间', name: 'create_time', style: {width: '160px', 'text-align': 'center'}}]
        $scope.keyword = ''
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }
      $scope.reset()

      $scope.searcher = (index, size) => {
        $scope.refreshing = true
        var previous = $scope.tableData && $scope.tableData._select
        return $scope.ajax('list_get', {
          pageindex: index || $scope.pageIndex,
          pagesize: size || $scope.pageSize,
          isv_user_name: $scope.keyword
        }, (data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.tableData = data.user_list
            $scope.total = data.list_count
            if ($scope.tableData && $scope.tableData[0]) {
              if (previous) {
                $scope.tableData._select = [].concat.apply([], $scope.tableData.map(r => ((previous.id == r.id) ? [r] : [])))[0]
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

      $scope.deleteUser = () => {
        return $rootScope.confirm('请确认是否要删除开发者？', () => {
          return $scope.ajax('isv_delete', {
            isv_user_id: $scope.tableData._select && $scope.tableData._select.id
          }, (data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.research()
              $rootScope.warn('删除成功', 1)
            }
          });
        })
      }

      let IsvAppenderController = (scope, user_list) => {
        scope.original_user_list = user_list
        scope.user_list = scope.original_user_list
        scope.keyword = ''
        scope.columns = [
          {text: '开发者名称', name: 'user_name', style: {'text-align': 'center', 'width': '228px'}
        }, {text: '公司名称', name: 'company', style: {width: '320px', 'text-align': 'center'}},
        ]
        scope.multiple = true
        scope.filter = () => {
          scope.user_list = scope.original_user_list.filter((user)=>{
            return user.user_name.indexOf(scope.keyword) != -1 || user.company.indexOf(scope.keyword) != -1
          })
        }
        scope.save = () => {
          if (scope.refreshing) {return}
          let list = [].concat.apply([], scope.user_list.map((r) => {return r._checked ? [{user_id: r.user_id}] : []}))
          if (!list.length) {
            scope.error = '请选择至少一位开发者进行添加'
            return
          }
          scope.refreshing = true
          return $http.post('/agent', {
            module: 'application',
            partial: 'noapply',
            api: 'isv_save',
            param: {
              user_list: list
            }
          }).then(body => {
            if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
              scope.close()
              $scope.reset()
              return body.data
            }
          }, why => {
            scope.error = why
            return $q.reject(why)
          }).finally(() => {scope.refreshing = false})
        }

        scope.close = () => {
          $mdDialog.hide()
        }


      }

      $scope.appender = (ev, api) => {
        if ($scope.refreshing) {return}
        $scope.refreshing = true
        return $scope.ajax('isv_list_get', {
          isv_user_name: ''
        }, (data) => {
          console.log(data)
          if (data.user_list && data.user_list.length) {
            $mdDialog.show({
              controller: IsvAppenderController,
              template: `
              <md-dialog aria-label="添加开发者" class="reminderTwoColumn" aria-describedby="reminder">
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
                          <form class="search-wrapper">
                              <div class="search-group">
                                  <button type="submit">
                                      <md-icon class="md-primary" md-svg-icon="action:ic_search_24px"></md-icon>
                                  </button>
                                  <input type="text" class="searcher" ng-model="keyword" ng-change="filter()" placeholder="请输入关键字......" />
                              </div>
                          </form>
                          <div class="table-wrapper">
                              <rop-fixed-table cols="columns" data="user_list" cursor="index" keyword="keyword" multiple="multiple" />
                              <div class="app-loading" ng-if="refreshing">
                                  <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                              </div>
                          </div>
                      </div>
                  </md-dialog-content>
                  
                  <md-dialog-actions layout="row">
                      <div class="message wideDialog" ng-if="error">
                          <span ng-bind="error"></span>
                      </div>
                    <md-button ng-click="save()">确定</md-button>
                  </md-dialog-actions>
              </md-dialog>
          `,
              autoWrap: false,
              targetEvent: ev,
              clickOutsideToClose: true,
              parent: angular.element(document.querySelector('body>section>md-content')),
              locals: {user_list: data.user_list}
            })
          } else {
            $rootScope.alert('尚未有任何开发者')
          }
        }).finally(() => {$scope.refreshing = false})
      }




      window.test = $scope
      //$scope.$on("$destroy", event => {});
    }]
})
