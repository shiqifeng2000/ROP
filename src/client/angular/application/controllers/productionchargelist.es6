/**
 * Created by zhangjj on 27/03/2017.
 */
define(['../../services'], function (cta) {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog','$location',
    ($rootScope, $scope, $q, $http, $mdDialog, $location) => {
      let initQ, initChargeUserQ, initChargeProdQ

      $scope.reset = () => {
        $scope.mode = 0
        $scope.userList = []
        $scope.prodList = []
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
        initQ = initFunction()
        $scope.sort_flag = '0'
      }

      $scope.reset()

      $scope.research = () => {
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.resetCharge = () => {
        $scope.loading = true
        $scope.chargeUserKeyWord = ''
        $scope.chargeProdKeyWord = ''
        $scope.chargeUserList = []
        $scope.chargeProdList = []
        $scope.chargeUserData = []
        $scope.chargeProdData = []
        initChargeUserQ = initChargeUser()
        initChargeProdQ = initChargeProd()
        $q.all([initChargeUserQ, initChargeProdQ]).finally(() => {
          $scope.loading = false
        })
      }

      $scope.sort = () => {
        $scope.sort_flag = ($scope.sort_flag == '1') ? '0' : '1'
        $scope.research()
      }

      $scope.goToNextStep = () => {
        $scope.mode = 1
        $scope.resetCharge()
      }

      $scope.backToFistStep = () => {
        $scope.mode = 0
        $scope.research()
      }

      $scope.selectUser = (user) => {
        $scope.currentUser = user
        $scope.research()
      }

      $scope.selectProd = (prod) => {
        $scope.currentProd = prod
        $scope.research()
      }

      $scope.selectChargeUser = (user) => {
        $scope.chargeUserList._select = user
      }

      $scope.searcher = (index, size) => {
        if ($scope.refreshing) { return }
        $scope.refreshing = true
        return initQ.then(() => {
          return $scope.ajax('charge_get', {
            pageindex: index || $scope.pageIndex,
            pagesize: size || $scope.pageSize,
            isv_user_id: $scope.currentUser.user_id ? $scope.currentUser.user_id : '',
            product_id: $scope.currentProd.product_id ? $scope.currentProd.product_id : '',
            sort_name: 'rx_insertTime',
            sort_flag: $scope.sort_flag,
          }).then((data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.data_list = data.data_list
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

      $scope.researchChargeUser = () => {
        return initChargeUserQ.then(() => {
          let _select = $scope.chargeUserList._select
          $scope.chargeUserList = [].concat.apply([], $scope.chargeUserData.map(r => ((r.user_name.indexOf($scope.chargeUserKeyWord) != -1) ? [r] : [])))
          $scope.chargeUserList._select = _select
          return $scope.chargeUserList
        })
      }

      $scope.researchChargeProd = () => {
        return initChargeUserQ.then(() => {
          let _select = $scope.chargeProdList._select
          $scope.chargeProdList = [].concat.apply([], $scope.chargeProdData.map(r => ((r.product_name.indexOf($scope.chargeProdKeyWord) != -1) ? [r] : [])))
          $scope.chargeProdList._select = _select
          return $scope.chargeProdList
        })
      }

      let ResultController = (scope, user, list) => {
        scope.user = user
        scope.prodList = list
        scope.save = () => {
          if (scope.refreshing) { return }
          if (scope.prodList.length === 0) {
            scope.close()
            $scope.backToFistStep()
            return
          }
          scope.refreshing = true
          let myList = []
          scope.prodList.forEach((prod) => {
            let item = {
              'product_id': prod.product_id,
              'product_price': prod.priceResult.price,
              'product_amount': prod.priceResult.amount,
              'price_count': prod.count
            }
            myList.push(item)
          })
          return $http.post('/agent', {
            module: 'application',
            partial: $rootScope.tab.key,
            api: 'charge_detail_save',
            param: {
              isv_user_id: scope.user.user_id,
              product_list: myList
            }
          }).then(body => {
            if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
              scope.close()
              $scope.backToFistStep()
            } else {
              return $q.reject(body.data.msg)
            }
          }, why => {
            scope.error = why
            return $q.reject(why)
          }).finally(() => { scope.refreshing = false })
        }

        scope.close = () => {
          return $mdDialog.hide()
        }
      }

      $scope.showResult = (ev) => {
        if ($scope.refreshing) { return }
        if ($scope.chargeForm.$invalid) {
          $scope.chargeForm.$error.required && $scope.chargeForm.$error.required.forEach(r => { r.$setDirty(true) })
          $scope.chargeForm.$error.pattern && $scope.chargeForm.$error.pattern.forEach(r => { r.$setDirty(true) })
          $scope.chargeForm.$error.maxlength && $scope.chargeForm.$error.maxlength.forEach(r => { r.$setDirty(true) })
          $scope.chargeForm.$error.email && $scope.chargeForm.$error.email.forEach(r => { r.$setDirty(true) })
          return
        }

        let list = $scope.chargeProdList.filter((item) => {
          return item.checked === '1'
        })
        $mdDialog.show({
          controller: ResultController,
          template: `
                            <md-dialog aria-label="产品授权内容" class="info-table">
                                <md-toolbar>
                                    <div class="md-toolbar-tools">
                                        <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings">
                                            <md-icon md-svg-icon="content:ic_archive_24px"></md-icon>
                                        </md-button>
                                        <h3 flex><span>产品授权内容</span></h3>
                                        <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                                            <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                                        </md-button>
                                    </div>
                                </md-toolbar>
                                <md-dialog-content>
                                    <div class="md-dialog-content">
                                        <div class="header-container">
                                            <table cellspacing="0" class="md-datatable">
                                                <thead>
                                                    <tr>
                                                        <th><span>授权用户</span></th>
                                                        <th><span>授权产品</span></th>
                                                        <th><span>充值金额（元）</span></th>
                                                        <th><span>充值调用次数</span></th>
                                                    </tr>
                                                </thead>
                                            </table>
                                        </div>
                                        <div class="scroller">
                                            <table cellspacing="0" class="md-datatable">
                                                <tbody>
                                                    <tr ng-repeat="prod in prodList track by $index">
                                                        <td><span ng-bind="user.user_name"></span></td>
                                                        <td><span ng-bind="prod.product_name"></span></td>
                                                        <td><span ng-bind="prod.priceResult.price * prod.count"></span></td>
                                                        <td><span ng-bind="prod.priceResult.amount * prod.count"></span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div class="message" ng-if="prodList.length === 0" style="color: #ff7c7c;font-size: 12px; margin-top: 8px;">
                                                <span >请选择要授权产品</span>
                                            </div>
                                        </div>
                                    </div>
                                    </md-dialog-content>
                                    <md-dialog-actions layout="row">
                                        <md-button ng-click="close()" type="submit">取消</md-button>
                                        <md-button ng-click="save()" type="submit" >保存</md-button>
                                    </md-dialog-actions>
                                </md-dialog>
                    `,
          parent: angular.element('body>section>md-content'),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {user: $scope.chargeUserList._select, list: list}
        })
      }

      function initFunction () {
        $scope.loading = true
        return $scope.ajax('charge_init').then((data) => {
          $scope.userList = [{
            user_id: '',
            user_name: '全部用户'
          }].concat(data.user_list)
          $scope.currentUser = $scope.userList[0]
          $scope.prodList = [{
            product_id: '',
            product_name: '全部产品'
          }].concat(data.product_list)
          $scope.currentProd = $scope.prodList[0]
        }).finally(() => {
          $scope.loading = false
        })
      }

      function initChargeUser () {
        if ($scope.refreshingUser) { return }
        $scope.refreshingUser = true
        return $scope.ajax('charge_detail_user_init').then((data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.chargeUserData = data.user_list
            $scope.chargeUserList = data.user_list
            if ($scope.chargeUserList.length > 0) {
              $scope.chargeUserList._select = $scope.chargeUserList[0]
            } else {
              $scope.chargeUserList._select = {}
            }
          }
        }).finally(() => {
          $scope.refreshingUser = false
        })
      }

      function initChargeProd () {
        if ($scope.refreshingProd) { return }
        $scope.refreshingProd = true
        return $scope.ajax('charge_detail_production_init').then((data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.chargeProdData = data.data_list
            $scope.chargeProdList = data.data_list
            // $scope.chargeProdList = data.data_list.concat($scope.chargeProdData).concat($scope.chargeProdData);
          }
        }).finally(() => {
          $scope.refreshingProd = false
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
        if (!$scope.refreshing && !$scope.refreshingUser && !$scope.refreshingProd && !$scope.loading) {
          $scope.backToFistStep()
        }
      }
      $scope.$on('$destroy', event => {
        $rootScope.globalBack = null
      })
    }]
})
