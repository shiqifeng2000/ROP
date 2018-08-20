define([], function (cta) {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$timeout', '$mdDialog', '$location',
    ($rootScope, $scope, $q, $http, $timeout, $mdDialog, $location) => {
      let getAppListQ, getApiListQ, getCategoryListQ
      //$scope.loading = true
      $scope.hasApplied = true
      $scope.appList = []

      $scope.columns = [{
        text: '查看账号',
        name: '',
        style: {'text-align': 'center', 'width': '88px'},
        compile: '<md-icon class="preview_icon" md-svg-icon="/resource/application/preview-disabled.svg" ng-click="$parent.$parent.col.checkApp($parent.row)" style="width: 16px; height: 38px;"></md-icon>',
        checkApp: (app) => { $scope.checkApp(app)}
      }, {
        text: '应用名称',
        name: 'app_name',
        style: {'text-align': 'left'}
      }, {
        text: '状态',
        name: 'status',
        compile: '<md-button class="md-raised md-primary panel-icon rank high-rank" aria-label="data control" ng-if="$parent.$parent.row.status===\'未审核\'">未审核</md-button><md-button class="md-raised md-primary panel-icon low-rank rank" aria-label="data control" ng-if="$parent.$parent.row.status===\'已审核\'">已审核</md-button>',
        style: {'text-align': 'center', 'width': '160px'}
      }, {
        text: '添加时间',
        name: 'rx_insertTime',
        style: {'text-align': 'center', 'width': '160px'}
      }]

      $scope.reset = () => {
        $scope.mode = 0
        $scope.keyword = ''
        //$scope.appList._select = undefined
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
        getCategoryListQ = getCategoryList()
      }

      $scope.reset()

      $scope.searcher = (index, size) => {
        getAppListQ = getAppList(index, size);
        return getAppListQ
      }

      $scope.research = () => {
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.setApp = (event) => {
        $scope.mode = 1
        $scope.hasApplied = '1'
        $scope.resetApi()
      }

      $scope.back = () => {
        $scope.mode = 0
        $scope.searcher()
      }

      function init () {
        $scope.loading = true
        $scope.config = {}
        return $scope.ajax('app_list_init').then(data => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            // btnApplyApi : "1"   设置应用按钮
            // btnCopy : "1"       复制应用按钮
            // btnDelete : "1"     删除应用按钮
            // btnInsert : "1"     添加应用按钮
            // btnUpdate : "1"     修改应用按钮
            $scope.config = data.role_list
          }
        }).finally(() => {
          $scope.loading = false
        })
      }

      function getAppList (index, size) {
        $scope.refreshing = true
        var previous = $scope.appList && $scope.appList._select
        return $scope.ajax('app_list_get', {
          pageindex: index || $scope.pageIndex,
          pagesize: size || $scope.pageSize,
          app_name: $scope.keyword
        }).then(data => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.appList = data.app_list
            let index = $scope.appList.map((app) => {return app.app_id}).indexOf(previous)
            if ($scope.appList && $scope.appList[0]) {
              if (previous) {
                $scope.appList._select = [].concat.apply([], $scope.appList.map(r => ((previous.app_id == r.app_id) ? [r] : [])))[0]
              } else {
                $scope.appList._select = $scope.appList[0]
              }
            }
            $scope.total = data.list_count
          } else {
            $rootScope.warn(data.msg)
            $scope.total = 0
          }
        }, () => {
          $scope.total = 0
        }).finally(() => {
          $scope.refreshing = false
        })
      }

      // API列表 mode: 1

      $scope.resetApi = () => {
        $scope.currentCat = $scope.catList[0]
        $scope.currentSta = $scope.staList[0]
        $scope.apiList = []
        if ($scope.hasApplied === '1') {
          $scope.columnsApi = columnApplied
        } else {
          $scope.columnsApi = columnNoApplied
        }
        $scope.keywordApi = ''
        $scope.pageIndexApi = 1
        $scope.pageSizeApi = new Number(10)
      }

      let columnNoApplied = [{
        text: 'API等级',
        name: 'api_level',
        style: {'text-align': 'center', 'width': '160px'},
        compile: '<md-button class="md-raised md-primary panel-icon rank high-rank" aria-label="data control" ng-if="$parent.$parent.row.api_level===\'0\'">高级</md-button><md-button class="md-raised md-primary panel-icon medium-rank rank" aria-label="data control" ng-if="$parent.$parent.row.api_level===\'2\'">中级</md-button><md-button class="md-raised md-primary panel-icon low-rank rank" aria-label="data control" ng-if="$parent.$parent.row.api_level===\'1\'">低级</md-button>'
      }, {
        text: 'API名称',
        name: 'api_name',
        style: {'text-align': 'left'},
        linker: {
          create: row => {return `${Constant.protocol}://${Constant.host}:${Constant.port}/api/ApiPreview-${row.api_id}.html`},
          target: '_blank'
        }
      }, {
        text: 'API描述',
        name: 'api_title',
        style: {'text-align': 'left'}
      }]

      let columnApplied = columnNoApplied.concat([{
        text: 'API状态',
        name: 'status',
        compile: '<md-button class="md-raised md-primary panel-icon rank high-rank" aria-label="data control" ng-if="$parent.$parent.row.status===\'未审核\'">未审核</md-button><md-button class="md-raised md-primary panel-icon low-rank rank" aria-label="data control" ng-if="$parent.$parent.row.status===\'已审核\'">已审核</md-button>',
        style: {'text-align': 'center', 'width': '160px'}
      }, {
        text: '类型',
        name: 'apply_status',
        style: {'text-align': 'center', 'width': '160px'}
      }])

      $scope.catList = [{
        cat_id: '',
        cat_name: '全部类型'
      }]

      $scope.staList = [{
        sta_id: undefined,
        sta_name: '全部状态'
      }, {
        sta_id: '1',
        sta_name: '已审核'
      }, {
        sta_id: '0',
        sta_name: '未审核'
      }]

      $scope.searcherApi = (index, size) => {
        getApiListQ = getApiList(index, size)
        return getApiListQ
      }

      $scope.getCheckedApi = () => {
        if (!Array.isArray($scope.apiList)) {
          return []
        }
        return $scope.apiList.filter((api) => {
          return api._checked
        })
      }

      $scope.deleteApi = () => {
        if ($scope.getCheckedApi().length === 0) {
          return
        }
        return $rootScope.confirm(`确定要删除这些API吗？`, () => {
          $scope.refreshing = true
          let api_id_list = $scope.getCheckedApi().map((api) => {
            return {api_id: api.api_id}
          })
          return $scope.ajax('delete_api', {
            api_id_list: api_id_list,
            app_id: $scope.appList._select && $scope.appList._select.app_id
          }).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.researchApi()
            } else {
              $rootScope.alert(data.msg)
            }
          }).finally(() => {
            $scope.refreshing = false
          })
        })
      }

      $scope.applyApi = () => {
        if ($scope.getCheckedApi().length === 0) {
          return
        }
        return $rootScope.confirm(`确定要申请这些API吗？`, () => {
          $scope.refreshing = true
          let api_id_list = $scope.getCheckedApi().map((api) => {
            return {api_id: api.api_id}
          })
          return $scope.ajax('apply_api', {
            api_id_list: api_id_list,
            app_id: $scope.appList._select && $scope.appList._select.app_id,
            cat_id: $scope.currentCat && $scope.currentCat.cat_id
          }).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.researchApi()
            } else {
              $rootScope.alert(data.msg)
            }
          }).finally(() => {
            $scope.refreshing = false
          })
        })
      }

      $scope.researchApi = () => {
        $scope.pageIndexApi = 1
        $scope.pageSizeApi = new Number(10)
      }

      $scope.selectCat = (cat) => {
        $scope.currentCat = cat
        $scope.researchApi()
      }

      $scope.selectSta = (sta) => {
        $scope.currentSta = sta
        $scope.researchApi()
      }

      /*$scope.$watch(() => {
        return $scope.hasApplied
      }, () => {

      })*/
      $scope.resetCount = ()=>{
        if ($scope.refreshing) {
          return
        }
        if ($scope.hasApplied === '1') {
          $scope.columnsApi = columnApplied
        } else {
          $scope.columnsApi = columnNoApplied
        }
        $scope.pageIndexApi = 1
        $scope.pageSizeApi = new Number(10)
      }

      function getApiList (index, size) {
        $scope.refreshing = true
        $scope.apiList = []
        return getCategoryListQ.then(() => {
          if ($rootScope.tab.key != 'applist') {
            return $q.reject()
          }
          return $scope.ajax($scope.hasApplied === '1' ? 'api_list_get' : 'api_unapplied_list_get', {
            pageindex: index || $scope.pageIndexApi,
            pagesize: size || $scope.pageSizeApi,
            api_name: $scope.keywordApi,
            app_id: $scope.appList._select && $scope.appList._select.app_id,
            cat_id: $scope.currentCat.cat_id,
            status: $scope.hasApplied === '1' ? $scope.currentSta.sta_id : undefined
          }).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.apiList = data.api_list
              if ($scope.hasApplied === '1') {
                $scope.apiList.forEach((api) => {
                  if (api.apply_status === '免审核') {
                    api._locked = true
                  }
                })
              }
              $scope.totalApi = data.list_count
            } else {
              $rootScope.alert(data.msg)
              $scope.totalApi = 0
            }
          }, () => {
            $scope.totalApi = 0
          }).finally(() => {
            $scope.refreshing = false
          })
        })
      }

      function getCategoryList () {
        $scope.refreshing = true
        return $scope.ajax('api_category_list_get', {
          pageindex: 1,
          pagesize: 999
        }).then(data => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.catList = [{
              cat_id: '',
              cat_name: '全部类型'
            }].concat(data.data_list)
          } else {
            $rootScope.alert(data.msg)
          }
        }).finally(() => {
          $scope.refreshing = false
        })
      }

      // 查看供应商账号信息 mode = 2
      $scope.checkApp = (app) => {
        $scope.mode = 2
        $scope.refreshing0 = false
        $scope.refreshing1 = false
        $scope.refreshing2 = false
        $scope.refreshing3 = false
        $scope.appInfo = app
      }

      // type: 0 生产secret 1 沙箱secret 2 生产token 3 沙箱token
      $scope.resetApp = (type) => {
        if (!$scope.appInfo) {
          return
        }
        let str = 'App Secret',
          prefix = (type == '1') ? 'App Secret重置后，沙箱环境中使用该应用帐号调用API的程序配置需要同步修改。' : ((type == '0') ? 'App Secret重置后，生产环境中使用该应用帐号调用API的程序配置需要同步修改。' : '')
        if (type == '2' || type == '3') {
          str = 'Access Token'
        }
        return $rootScope.confirm(`${prefix}确定要重置${str}吗？`, () => {
          let url = ''
          switch (type) {
            case '0':
              url = 'reset_prod_secret'
              $scope.refreshing0 = true
              break
            case '1':
              url = 'reset_dev_secret'
              $scope.refreshing1 = true
              break
            case '2':
              url = 'reset_prod_token'
              $scope.refreshing2 = true
              break
            case '3':
              url = 'reset_dev_token'
              $scope.refreshing3 = true
              break
            default:
              url = ''
          }
          $scope.refreshing = true

          return $http.post('/agent', {
            module: 'dashboard',
            partial: 'applist',
            api: url,
            param: {
              app_id: $scope.appInfo.app_id
            }
          }).then(body => {
            if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
              switch (type) {
                case '0':
                  $scope.appInfo.appsecret = body.data.appsecret
                  break
                case '1':
                  $scope.appInfo.test_appsecret = body.data.test_appsecret
                  break
                case '2':
                  $scope.appInfo.access_token = body.data.access_token
                  $scope.appInfo.expiring_time = body.data.expiring_time
                  break
                case '3':
                  $scope.appInfo.test_access_token = body.data.test_access_token
                  $scope.appInfo.test_expiring_time = body.data.test_expiring_time
                  break
                default:
                  url = ''
              }
              return body.data
            }
          }, why => {
            return $q.reject(why)
          }).finally(() => {
            $scope.refreshing = false
            switch (type) {
              case '0':
                $scope.refreshing0 = false
                break
              case '1':
                $scope.refreshing1 = false
                break
              case '2':
                $scope.refreshing2 = false
                break
              case '3':
                $scope.refreshing3 = false
                break
              default:
                url = ''
            }
          })
        })
      }

      // 添加|复制|修改|删除应用

      $scope.createApp = (event) => {
        showAppDialog(event, {})
      }

      $scope.copyApp = (event, fromApp) => {
        showAppDialog(event, {}, fromApp)
      }

      $scope.deleteApp = (event) => {
        if (!$scope.appList._select || !$scope.appList._select) {return}
        if ($scope.appList._select.status === '已审核') {
          $rootScope.alert('不可删除已审核应用！')
        }
        return $rootScope.confirm('确定要删除该应用？', () => {
          $scope.refreshing = true
          return $scope.ajax('delete_app', {
            app_id: $scope.appList._select && $scope.appList._select.app_id
          }).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.research()
            } else {
              $rootScope.alert(data.msg)
            }
          }).finally(() => {
            $scope.refreshing = false
          })
        })
      }

      $scope.editApp = (event, app) => {
        let currentApp = {
          app_id: app.app_id,
          app_name: app.app_name,
          remark: app.remark
        }
        showAppDialog(event, currentApp)
      }

      let CreateAppCtrl = (scope, app, fromApp) => {
        scope.app = app
        scope.fromApp = fromApp

        scope.save = () => {
          if (scope.refreshing) { return }
          if (scope.appForm.$invalid) {
            scope.appForm.$error.required && scope.appForm.$error.required.forEach(r => { r.$setDirty(true) })
            scope.appForm.$error.maxlength && scope.appForm.$error.maxlength.forEach(r => { r.$setDirty(true) })
            scope.error = '请检查输入是否正确'
            return
          }
          scope.refreshing = true
          return $http.post('/agent', {
            module: 'dashboard',
            partial: 'applist',
            api: 'create_api',
            param: {
              login_user_type: $rootScope.profile && $rootScope.profile.login_user_type,
              app_id: scope.app.app_id,
              app_name: scope.app.app_name,
              remark: scope.app.remark,
              copy_app_id: scope.fromApp ? scope.fromApp.app_id : undefined
            }
          }).then(body => {
            if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
              scope.close()
              if (scope.app.app_id) {
                $scope.searcher()
              } else {
                // 添加 || 复制API，跳回首页
                $scope.research()
              }
              return body.data
            } else {
              scope.error = body.data.msg
            }
          }, why => {
            scope.error = why
            return $q.reject(why)
          }).finally(() => { scope.refreshing = false })
        }

        scope.close = () => {
          $mdDialog.hide()
        }
      }

      function showAppDialog (ev, app, fromApp) {
        $mdDialog.show({
          controller: CreateAppCtrl,
          template: `
          <md-dialog aria-label="{{fromApp?'复制应用':(app.app_id?'修改应用':'添加应用')}}" class="form" aria-describedby="quick edit">
              <md-toolbar>
                <div class="md-toolbar-tools">
                  <md-icon md-svg-icon="navigation:ic_apps_24px"></md-icon>
                  <h3><span ng-bind="fromApp?'复制应用':(app.app_id?'修改应用':'添加应用')"></span></h3>
                  <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                    <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                  </md-button>
                </div>
              </md-toolbar>
              <md-dialog-content>
                <form class="md-dialog-content postfix-input" name="appForm" autocomplete="off">
                  <div class="input-container" ng-if="fromApp">
                    <label>应用来源</label>
                    <span ng-bind="fromApp.app_name" style="text-align: left;display: inline-block;width:200px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;position: static; padding-left: 8px;"></span>
                  </div>
                  <div class="input-container">
                    <label>新应用名称</label>
                    <input type="text" name="name" maxlength="100" spellcheck="false" ng-model="app.app_name"  style="text-align: left;" required/>
                  </div>
                  <md-input-container class="md-block">
                    <label>备注</label>
                    <textarea ng-model="app.remark" md-maxlength="100" rows="3" md-select-on-focus style="overflow: auto"></textarea>
                  </md-input-container>
                  <div class="hint" ng-if="fromApp" aria-hidden="false" style="font-size: 12px;
                    line-height: 14px;height: 28px;
                    transition: all .3s cubic-bezier(0.55,0,0.55,0.2);
                    color: rgba(0,0,0,0.38);">开发者可以快速复制相似应用，新应用将自动被平台管理员审核，仅需供应商审核申请的API、开发者即可调用。
                  </div>
                  <div class="hint" ng-if="!fromApp && !app.app_id" aria-hidden="false" style="font-size: 12px;
                    line-height: 14px;height: 28px;
                    transition: all .3s cubic-bezier(0.55,0,0.55,0.2);
                    color: rgba(0,0,0,0.38);">您可以创建新的应用。平台管理员审核后，您可以在“API设置”中申请供应商的API。供应商审核后您可以调用API。
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
            </md-dialog>`,
          autoWrap: false,
          targetEvent: ev,
          clickOutsideToClose: true,
          parent: angular.element(document.querySelector('body>section>md-content')),
          locals: {app: app, fromApp: fromApp}
        })
      }

      window.test = $scope

      $scope.$watch(() => $scope.mode, mode => {
        if (mode) {
          $rootScope.globalBack = globalBack
        } else {
          $rootScope.globalBack = null
        }
      })
      let globalBack = () => {
        if (!$scope.refreshing && !$scope.refreshing0 && !$scope.refreshing1 && !$scope.refreshing2 && !$scope.refreshing3 && !$scope.loading) {
          $scope.back()
        }
      }
      $scope.$on('$destroy', event => {
        $rootScope.globalBack = null
      })
    }]
})
