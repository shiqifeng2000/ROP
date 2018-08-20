define([], function (cta) {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$timeout', '$mdDialog',
    ($rootScope, $scope, $q, $http, $timeout, $mdDialog) => {
      $scope.tableData = []
      $scope.reset = () => {
        $scope.columns = [
          {
            text: '公告名称',
            name: 'notice_title',
            compile: '<a href="javascript:" ng-click="$parent.$parent.col.showContent($event, $parent.row)">{{$parent.row[$parent.col.name]}}<md-tooltip md-direction="bottom">{{$parent.row[$parent.col.name]}}</md-tooltip></a>',
            showContent: (event, notice) => { $scope.showContent(event, notice)}
          },
          {text: '创建者', name: 'create_user_name', style: {width: '160px', 'text-align': 'center'}},
          {text: '添加时间', name: 'rx_insertTime', style: {width: '160px', 'text-align': 'center'}}]
        $scope.keyword = ''
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
          user_type: $rootScope.profile.login_user_type,
          noticet_title: $scope.keyword
        }, (data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.tableData = data.platform_list
            if ($scope.tableData && $scope.tableData[0]) {
              if (previous) {
                $scope.tableData._select = [].concat.apply([], $scope.tableData.map(r => ((previous.notice_id == r.notice_id) ? [r] : [])))[0]
              } else {
                $scope.tableData._select = $scope.tableData[0]
              }
            }
            $scope.total = data.list_count
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
      $scope.research = () => {
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.showContent = (event, notice) => {
        showContentDialog(event, notice)
      }


      let ShowContentCtrl = (scope, notice) => {
        scope.notice = notice

        scope.close = () => {
          $mdDialog.hide()
        }
      }

      function showContentDialog (ev, notice) {
        if (notice){
          $mdDialog.show({
            controller: ShowContentCtrl,
            template: `
          <md-dialog aria-label="公告信息" class="form notice" aria-describedby="quick edit">
              <md-toolbar>
                <div class="md-toolbar-tools">
                  <md-icon md-svg-icon="navigation:ic_apps_24px"></md-icon>
                  <h3><span ng-bind="'公告信息'"></span></h3>
                  <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                    <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                  </md-button>
                </div>
              </md-toolbar>
              <md-dialog-content>
                <div class="title">
                  <div class="md-toolbar-tools">
                      <md-button class="md-fab md-primary md-mini" aria-label="Eat cake">
                          <md-icon md-svg-icon="av:ic_volume_down_24px"></md-icon>
                      </md-button>
                      <h5 flex>
                          <span>{{notice.notice_title}}</span>
                      </h5>
                      <small class="status"><a href="javascript:" class="pr-5">{{notice.create_user_name}}</a> <span class="pr-5">|</span> <i class="fa fa-calendar pr-5"></i>{{notice.rx_insertTime}}</small>
                   </div>
                 </div>
                 <div class="content">
                   <div class="area" ng-bind-html="notice.notice_content  | unescapeHtml | trusthtml"></div>
</div>
              </md-dialog-content>
              <md-dialog-actions layout="row" style="display: none">
                <div class="message" ng-if="error">
                  <span ng-bind="error"></span>
                </div>
                <md-button ng-click="close()" type="submit">确定</md-button>
              </md-dialog-actions>
            </md-dialog>`,
            autoWrap: false,
            targetEvent: ev,
            clickOutsideToClose: true,
            parent: angular.element(document.querySelector('body>section>md-content')),
            locals: {notice: notice}
          })
        }
      }


      window.test = $scope
    }]
})
