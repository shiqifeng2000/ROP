/**
 * Created by zhangjj on 21/02/2017.
 */
define([], function () {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog', '$location',
    ($rootScope, $scope, $q, $http, $mdDialog, $location) => {
      let initApiFilterQ, initApiViewUserQ

      $scope.reset = () => {
        $scope.api_list = []
        $scope.cat_list = []
        $scope.status_list = []
        $scope.user_list = []
        $scope.app_list = []
        $scope.currentCat = {}
        $scope.currentStatus = {}
        $scope.currentApi = {}
        $scope.searcherKey = ''
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
        $scope.mode = 0
        initApiFilterQ = initApiFilter()
      }

      $scope.reset()

      $scope.research = () => {
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.selectCat = (cat) => {
        $scope.currentCat = cat
        $scope.research()
      }

      $scope.selectUser = (user) => {
        $scope.currentUser = user
        $scope.pageIndex2 = 1
        $scope.pageSize2 = new Number(10)
      }

      $scope.selectStatus = (status) => {
        $scope.currentStatus = status
        $scope.research()
      }

      $scope.searcher = (index, size) => {
        if ($scope.refreshing) {return}
        $scope.refreshing = true
        let previous = $scope.api_list && $scope.api_list._select
        return initApiFilterQ.then(() => {
          return $scope.ajax('flow_list_get', {
            pageindex: index || $scope.pageIndex,
            pagesize: size || $scope.pageSize,
            api_name: $scope.searcherKey ? $scope.searcherKey : '',
            cat_id: $scope.currentCat && $scope.currentCat.cat_id,
            status: $scope.currentStatus && $scope.currentStatus.status_id
          }).then((data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.api_list = data.data_list
              if ($scope.api_list && $scope.api_list[0]) {
                if (previous) {
                  $scope.api_list._select = [].concat.apply([], $scope.api_list.map(r => ((previous.api_id == r.api_id) ? [r] : [])))[0]
                } else {
                  $scope.api_list._select = $scope.api_list[0]
                }
              }
              $scope.total = data.list_count
            } else {
              $rootScope.alert(data.msg)
              $scope.total = 0
            }
          }).finally(() => {
            $scope.refreshing = false
          })
        })
      }

      // ApiController
      let Controller = (scope, item) => {
        scope.item = item
        let isApp = !!item.app_id
        scope.save = () => {
          if (scope.refreshing) {return}
          if (scope.configForm.$invalid) {
            scope.configForm.$error.required && scope.configForm.$error.required.forEach(r => {r.$setDirty(true)})
            scope.configForm.$error.validUnicodeLength && scope.configForm.$error.validUnicodeLength.forEach(r => {r.$setDirty(true)})
            scope.configForm.$error.maxlength && scope.configForm.$error.maxlength.forEach(r => {r.$setDirty(true)})
            scope.error = '请检查输入是否正确'
            return
          }
          scope.refreshing = true
          return $scope.ajax(isApp ? 'flow_isv_detail_save' : 'flow_detail_save', {
            api_id: scope.item.api_id,
            flow_switch: scope.item.flow_switch,
            minute_count: scope.item.minute_count,
            hour_count: scope.item.hour_count,
            day_count: scope.item.day_count,
            app_id: isApp ? scope.item.app_id : undefined
          }).then(data => {
            if (data && data.is_success === 'true') {
              if (isApp) {
                $scope.searcher2()
              } else {
                $scope.searcher()
              }
              scope.close()
            } else {
              scope.error = data.msg
              return $q.reject(data.msg)
            }
          }, why => {
            scope.error = why
            return $q.reject(why)
          }).finally(() => {
            scope.refreshing = false
          })
        }
        scope.resetCount = () => {
          if (scope.item && scope.item.flow_switch == '0') {
            scope.item.minute_count = '0'
            scope.item.hour_count = '0'
            scope.item.day_count = '0'
          }
        }
        scope.close = () => {
          return $mdDialog.hide()
        }
      }

      $scope.showDialog = (event, item) => {
        if ($scope.refreshing) {return $q.reject()}
        $scope.refreshing = true
        let isApp = !!item.app_id
        return $scope.ajax(isApp ? 'flow_isv_detail_get' : 'flow_detail_get', {
          api_id: isApp ? ($scope.currentApi && $scope.currentApi.api_id) : (item && item.api_id),
          app_id: (isApp && item) ? item.app_id : undefined
        }).then((data) => {
          if (data && data.is_success === 'true') {
            $mdDialog.show({
              controller: Controller,
              template: template,
              parent: angular.element('body>section>md-content'),
              targetEvent: event,
              clickOutsideToClose: true,
              locals: {item: data.api_flow}
            })
          }
        }).finally(() => {
          $scope.refreshing = false
        })
      }

      // Api View
      $scope.showAppView = (api) => {
        $scope.currentApi = api
        $scope.user_list = []
        $scope.app_list = []
        $scope.pageIndex2 = 1
        $scope.pageSize2 = new Number(10)
        initApiViewUserQ = initApiViewUser($scope.currentApi)
        $scope.mode = 1
      }
      $scope.searcher2 = (index, size) => {
        $scope.refreshing = true
        return initApiViewUserQ.then(() => {
          return $scope.ajax('flow_isv_list_get', {
            pageindex: index || $scope.pageIndex2,
            pagesize: size || $scope.pageSize2,
            api_id: $scope.currentApi && $scope.currentApi.api_id,
            user_id: $scope.currentUser && $scope.currentUser.user_id
          }).then((data) => {
            if (data && data.is_success === 'true') {
              $scope.app_list = data.data_list
              $scope.total2 = data.list_count
            } else {
              $rootScope.alert(data.msg)
              $scope.total2 = 0
            }
          }).finally(() => {
            $scope.refreshing = false
          })
        })
      }

      $scope.hideAppView = () => {
        $scope.mode = 0
      }

      function initApiFilter () {
        $scope.loading = true
        return $scope.ajax('flow_filter_init').then((data) => {
          $scope.cat_list = [{
            cat_id: '',
            cat_name: '全部类型'
          }].concat(data.cat_list)
          $scope.currentCat = $scope.cat_list[0]
          $scope.status_list = [{
            status_id: '',
            status_name: '全部状态'
          }].concat(data.status_list)
          $scope.currentStatus = $scope.status_list[0]
        }).finally(() => {
          $scope.loading = false
        })
      }

      function initApiViewUser (api) {
        $scope.refreshing = true
        $scope.user_list = [{
          user_id: '',
          user_name: '全部开发者'
        }]
        $scope.currentUser = $scope.user_list[0]
        return $scope.ajax('flow_isv_filter_init', {
          api_id: api && api.api_id
        }).then(data => {
          if (data && data.is_success === 'true') {
            $scope.user_list = $scope.user_list.concat(data.user_list)
          }
        })
      }

      let template = `
            <md-dialog aria-label="API流量管理" class="form" aria-describedby="quick edit">
              <md-toolbar>
                <div class="md-toolbar-tools">
                  <md-icon md-svg-icon="navigation:ic_apps_24px"></md-icon>
                  <h3><span ng-bind="'API流量控制'"></span></h3>
                  <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                    <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                  </md-button>
                </div>
              </md-toolbar>
              <md-dialog-content>
                <form class="md-dialog-content postfix-input" name="configForm" autocomplete="off">
                  <div class="input-container">
                    <label>流量控制开关</label>
                    <md-radio-group ng-model="item.flow_switch" ng-init="item.flow_swtich = '0'" ng-change="resetCount()">
                        <md-radio-button value="1" class="md-primary">开</md-radio-button>
                        <md-radio-button value="0" class="md-primary">关</md-radio-button>
                    </md-radio-group>
                  </div>
                  <div class="input-container">
                    <label>调用次数（每分钟）</label>
                    <input type="text" name="minute" maxlength="6" ng-model="item.minute_count" 
                    ng-pattern="'([0]|[1-9]\\\\d{0,5})'" ng-disabled="item.flow_switch === '0'" required/>
                    <span style="top: 0">次</span>
                  </div>
                  <div class="input-container">
                    <label>调用次数（每小时）</label>
                    <input type="text" name="hour" maxlength="6" ng-model="item.hour_count" ng-pattern="'([0]|[1-9]\\\\d{0,5})'" ng-disabled="item.flow_switch === '0'" required/>
                    <span style="top: 0">次</span>
                  </div>
                  <div class="input-container">
                    <label>调用次数（每天）</label>
                    <input type="text" name="day" maxlength="6" ng-model="item.day_count" ng-pattern="'([0]|[1-9]\\\\d{0,5})'" ng-disabled="item.flow_switch === '0'" required/>
                    <span style="top: 0">次</span>
                  </div>
                </form>
                <div class="app-loading" ng-if="refreshing">
                  <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                </div>
              </md-dialog-content>
              <md-dialog-actions layout="row">
                <div class="message" ng-if="error">
                  <span ng-bind="error"></span>
                </div>
                <md-button ng-click="save()" type="submit">保存</md-button>
              </md-dialog-actions>
            </md-dialog>`


      window.test = $scope
      $scope.$watch(() => $scope.mode, mode => {
        if (mode) {
          $rootScope.globalBack = globalBack
        } else {
          $rootScope.globalBack = null
        }
      })
      let globalBack = () => {
        if (!$scope.refreshing && !$scope.loading) {
          $scope.hideAppView()
        }
      }
      $scope.$on('$destroy', event => {
        $rootScope.globalBack = null
      })
    }]
})
