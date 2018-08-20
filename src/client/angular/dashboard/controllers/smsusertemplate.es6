/**
 * Created by robin on 22/11/2016.
 */
define(['../../services'], function (cta) {
    'use strict'
    return ['$rootScope', '$scope', '$q', '$location', '$http', '$timeout', '$mdDialog', 'MiscTool', 'ROPDateUtil',
      ($rootScope, $scope, $q, $location, $http, $timeout, $mdDialog, MiscTool, ROPDateUtil) => {
        let pipeQ

        $scope.columns = [{
          text: '模板内容',
          name: 'template_content',
          style: {'text-align': 'left'}
        }, {
          text: '用户通道',
          name: 'channel_name',
          style: {'text-align': 'center', 'width': '180px'}
        }, {
          text: '创建人',
          name: 'create_user_name',
          style: {'text-align': 'center', 'width': '180px'}
        }, {
          text: '模板状态',
          name: 'template_status',
          style: {'text-align': 'center', 'width': '120px'}
        }, {
          text: '添加时间',
          name: 'rx_insertTime',
          style: {'text-align': 'center', 'width': '240px'}
        }]

        let defaultPipe = {
          channel_id: '',
          channel_name: '短信全部通道'
        }

        $scope.tempList = []
        $scope.staList = [{
          sta_name: '全部状态',
          recharge_status: ''
        }, {
          sta_name: '已审核',
          recharge_status: '1'
        }, {
          sta_name: '未审核',
          recharge_status: '0'
        }]
        $scope.pipeList = [defaultPipe]

        $scope.reset = () => {
          $scope.loading = true
          $scope.currentPipe = defaultPipe
          $scope.currentSta = $scope.staList[0]
          $scope.maxdate = new Date()
          $scope.mindate = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          pipeQ = getPipeList()
          $scope.pageIndex = 1
          $scope.pageSize = new Number(10)
        }

        $scope.searcher = (index, size) => {
          $scope.refreshing = true
          return pipeQ.then(() => {
            var previous = $scope.tempList && $scope.tempList._select
            return $scope.ajax('list', {
              pageindex: index || $scope.pageIndex,
              pagesize: size || $scope.pageSize,
              user_name: $rootScope.profile && $rootScope.profile.login_user_name,
              user_channel_id: $scope.currentPipe && $scope.currentPipe.channel_id,
              template_status: $scope.currentSta && $scope.currentSta.recharge_status
            }, (data) => {
              if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
                $scope.tempList = data.template_list
                $scope.total = data.list_count
                if ($scope.tempList && $scope.tempList[0]) {
                  if (previous) {
                    $scope.tempList._select = [].concat.apply([], $scope.tempList.map(r => ((previous.template_id == r.template_id) ? [r] : [])))[0]
                  } else {
                    $scope.tempList._select = $scope.tempList[0]
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
          })
        }

        $scope.research = () => {
          $scope.pageIndex = 1
          $scope.pageSize = new Number(10)
        }

        $scope.creatTemp = (ev) => {
          let pipeList = $scope.pipeList.filter(pipe => {
            return pipe.channel_id !== ''
          })
          let temp = {
            template_content: ''
          }
          showTempDialog(ev, pipeList, temp)
        }

        $scope.editTemp = (ev) => {
          let pipeList = $scope.pipeList.filter(pipe => {
            return pipe.channel_id !== ''
          })
          let temp = {
            template_id: $scope.tempList._select && $scope.tempList._select.template_id,
            template_content: $scope.tempList && $scope.tempList._select.template_content,
            user_channel_id: $scope.tempList && $scope.tempList._select.user_channel_id
          }
          showTempDialog(ev, pipeList, temp)
        }

        $scope.deleteTemp = () => {
          if ($scope.refreshing || !$scope.tempList._select) {
            return
          }
          return $rootScope.confirm('确定要删除?', () => {
            $scope.refreshing = true
            $scope.ajax('delete', {
              template_id: $scope.tempList._select && $scope.tempList._select.template_id
            }).then((data) => {
              if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
                $scope.research()
              }
            }).finally(() => {
              $scope.refreshing = false
            })
          })
        }

        $scope.selectPipe = (pipe) => {
          $scope.currentPipe = pipe
          $scope.research()
        }
        $scope.selectSta = (status) => {
          $scope.currentSta = status
          $scope.research()
        }

        let CreateTempCtrl = (scope, pipeList, temp) => {
          scope.pipeList = pipeList
          scope.temp = temp
          if (temp.template_id){
            for (let i = 0; i < pipeList.length; i++){
              if (pipeList[i].channel_id === temp.user_channel_id){
                scope.currentPipe = pipeList[i]
                break
              }
            }
          } else {
            scope.currentPipe = pipeList[0]
          }

          scope.save = () => {
            if (scope.chargeForm.$invalid) {
              scope.chargeForm.$error.required && scope.chargeForm.$error.required.forEach(r => { r.$setDirty(true) })
              scope.chargeForm.$error.maxlength && scope.chargeForm.$error.maxlength.forEach(r => { r.$setDirty(true) })
              scope.error = '请检查输入是否正确'
              return
            }
            scope.refreshing = true
            return $http.post('/agent', {
              module: 'dashboard',
              partial: 'smsusertemplatelist',
              api: 'save',
              param: {
                user_name: $rootScope.profile && $rootScope.profile.login_user_name,
                channel_id: scope.currentPipe && scope.currentPipe.channel_id,
                template_content: scope.temp.template_content,
                template_id: scope.temp.template_id
              }
            }).then(body => {
              if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
                scope.close()
                if (scope.temp.template_id) {
                  $scope.searcher()
                } else {
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

          scope.select = (pipe) => {
            scope.currentPipe = pipe
          }

          scope.close = () => {
            $mdDialog.hide()
          }
        }


        function showTempDialog (ev, pipeList, temp) {
          $mdDialog.show({
            controller: CreateTempCtrl,
            template: `
          <md-dialog aria-label="添加模板" class="form" aria-describedby="quick edit">
              <md-toolbar>
                <div class="md-toolbar-tools">
                  <md-icon md-svg-icon="navigation:ic_apps_24px"></md-icon>
                  <h3><span>添加模板</span></h3>
                  <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                    <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                  </md-button>
                </div>
              </md-toolbar>
              <md-dialog-content>
                <form class="md-dialog-content" name="chargeForm" ng-submit="save()" autocomplete="off">
                  <div class="input-container">
                      <label style="width: 108px;">通道名称</label>
                      <md-menu class="md-dropdown cool" md-offset="1 50">
                          <md-button ng-click="$mdOpenMenu($event)" class="md-raised md-primary md-hue-1" md-theme="dracular" aria-label="data control" ng-disabled="refreshing"  style="width:200px;">
                              <span ng-bind="currentPipe.channel_name"></span>
                              <md-icon class="" md-svg-icon="navigation:ic_arrow_drop_down_24px"></md-icon>
                          </md-button>
                          <md-menu-content class="md-dropdown-content cool" style="width: 200px">
                              <md-menu-item ng-repeat="pipe in pipeList track by $index"><md-button ng-click="select(pipe)">{{pipe.channel_name}}</md-button></md-menu-item>
                          </md-menu-content>
                      </md-menu>
                  </div>
                  <md-input-container class="md-block">
                    <label>模板内容</label>
                    <textarea ng-model="temp.template_content" md-maxlength="200" rows="3" md-select-on-focus style="overflow: auto" required></textarea>
                  </md-input-container>
                  <a href="http://open.rongcapital.cn/welcome/document/9ea34b74-7545-41fc-932f-24382816e5e8" target="_blank" class="readmore" style="font-size: 1rem">
                    <span>模版说明</span>
                  </a>
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
            locals: {pipeList: pipeList, temp: temp}
          })
        }

        function getPipeList () {
          $scope.loading = true
          return $scope.ajax('init').then((data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              let pipeList = data.channel_list
              pipeList.unshift(defaultPipe)
              $scope.pipeList = pipeList
            }
          }).finally(() => {
            $scope.loading = false
          })
        }

        $scope.reset()

        window.test = $scope
      }
    ]
  }
)
