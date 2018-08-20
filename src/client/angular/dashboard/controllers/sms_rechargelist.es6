define([], function (cta) {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$timeout', '$mdDialog',
    ($rootScope, $scope, $q, $http, $timeout, $mdDialog) => {
      let pipeQ

      $scope.columns = [{
        text: '通道名称',
        name: 'channel_name',
        style: {'text-align': 'center'}
      }, {
        text: '充值条数',
        name: 'recharge_num',
        style: {'text-align': 'center'}
      }, {
        text: '是否审核',
        name: 'recharge_status',
        style: {'text-align': 'center'}
      }, {
        text: '添加时间',
        name: 'create_time',
        style: {'text-align': 'center'}
      }, {
        text: '备注',
        name: 'remark',
        style: {'text-align': 'center', 'width': '240px'}
      }]

      let defaultPipe = {
        channel_id: '',
        channel_name: '短信全部通道'
      }

      $scope.prodList = []
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
          var previous = $scope.prodList && $scope.prodList._select
          return $scope.ajax('charge_get', {
            pageindex: index || $scope.pageIndex,
            pagesize: size || $scope.pageSize,
            recharge_status: $scope.currentSta && $scope.currentSta.recharge_status,
            create_time_begin: $scope.mindate && `${$scope.mindate.getFullYear()}-${$scope.mindate.getMonth()+1}-${$scope.mindate.getDate()}`,
            create_time_end: $scope.maxdate && `${$scope.maxdate.getFullYear()}-${$scope.maxdate.getMonth()+1}-${$scope.maxdate.getDate()}`,
            channel_id: $scope.currentPipe && $scope.currentPipe.channel_id
          }, (data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.prodList = data.recharge_list
              $scope.total = data.list_count
              if ($scope.prodList && $scope.prodList[0]) {
                if (previous) {
                  $scope.prodList._select = [].concat.apply([], $scope.prodList.map(r => ((previous.recharge_id == r.recharge_id) ? [r] : [])))[0]
                } else {
                  $scope.prodList._select = $scope.prodList[0]
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

      $scope.creatProd = (ev) => {
        let pipeList = $scope.pipeList.filter(pipe => {
          return pipe.channel_id !== ''
        })
        console.log(pipeList)
        showProdDialog(ev, pipeList)
      }

      $scope.deleteProd = () => {
        if ($scope.refreshing || !$scope.prodList._select) {
          return
        }
        return $rootScope.confirm('确定要删除?', () => {
          $scope.refreshing = true
          $scope.ajax('charge_del', {
            recharge_id: $scope.prodList._select && $scope.prodList._select.recharge_id
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

      $scope.listAPI = () => {
        $scope.research()
      }


      let CreateProdCtrl = (scope, pipeList) => {
        scope.pipeList = pipeList
        scope.currentPipe = pipeList[0]
        scope.prod = {
          recharge_num: 100,
          remark: ''
        }

        scope.save = () => {
          if (scope.chargeForm.$invalid) {
            scope.chargeForm.$error.required && scope.chargeForm.$error.required.forEach(r => { r.$setDirty(true) })
            scope.chargeForm.$error.maxlength && scope.chargeForm.$error.maxlength.forEach(r => { r.$setDirty(true) })
            scope.error = '请检查输入是否正确'
            return
          }
          scope.refreshing = true
          console.log(scope.currentPipe)
          return $http.post('/agent', {
            module: 'dashboard',
            partial: 'smsrechargelist',
            api: 'charge_save',
            param: {
              user_name: $rootScope.profile && $rootScope.profile.login_user_name,
              channel_id: scope.currentPipe && scope.currentPipe.channel_id,
              recharge_num: scope.prod.recharge_num,
              remark: scope.prod.remark
            }
          }).then(body => {
            if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
              scope.close()
              $scope.research()
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


      function showProdDialog (ev, pipeList) {
        $mdDialog.show({
          controller: CreateProdCtrl,
          template: `
          <md-dialog aria-label="充值" class="form" aria-describedby="quick edit">
              <md-toolbar>
                <div class="md-toolbar-tools">
                  <md-icon md-svg-icon="navigation:ic_apps_24px"></md-icon>
                  <h3><span>充值</span></h3>
                  <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                    <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                  </md-button>
                </div>
              </md-toolbar>
              <md-dialog-content>
                <form class="md-dialog-content" name="chargeForm" ng-submit="save()" autocomplete="off">
                  <div class="input-container">
                      <label style="width: 108px;">通道名称</label>
                      <md-menu class="md-dropdown cool" md-offset="1 50" >
                          <md-button ng-click="$mdOpenMenu($event)" class="md-raised md-primary md-hue-1" md-theme="dracular" aria-label="data control" ng-disabled="refreshing">
                              <span ng-bind="currentPipe.channel_name"></span>
                              <md-icon class="" md-svg-icon="navigation:ic_arrow_drop_down_24px"></md-icon>
                          </md-button>
                          <md-menu-content class="md-dropdown-content cool" style="width: 264px">
                              <md-menu-item ng-repeat="pipe in pipeList track by $index"><md-button ng-click="select(pipe)">{{pipe.channel_name}}</md-button></md-menu-item>
                          </md-menu-content>
                      </md-menu>
                  </div>
                  <div class="input-container">
                      <label style="width: 108px;">充值数量</label>
                      <input type="number" name="group_name" ng-model="prod.recharge_num" max="999999" min="100" ng-pattern="'[0-9]*'" required/>
                  </div>
                  <md-input-container class="md-block">
                    <label>备注</label>
                    <textarea ng-model="prod.remark" md-maxlength="100" rows="3" md-select-on-focus style="overflow: auto"></textarea>
                  </md-input-container>
                  <div class="hint" ng-if="!subuser.sub_user_id" aria-hidden="false" style="font-size: 12px;
                    line-height: 14px;height: 28px;
                    transition: all .3s cubic-bezier(0.55,0,0.55,0.2);
                    color: rgba(0,0,0,0.38);">选择短信通道、填写短信的充值数量。管理员审核通过后您可以使用短信通道并查询通道余额。
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
          locals: {pipeList: pipeList}
        })
      }

      function getPipeList () {
        $scope.loading = true
        return $scope.ajax('charge_init').then((data) => {
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
    }]
})
