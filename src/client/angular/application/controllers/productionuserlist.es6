/**
 * Created by zhangjj on 22/03/2017.
 */
define(['../../services'], function (cta) {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog',
    ($rootScope, $scope, $q, $http, $mdDialog) => {
      let initQ, initUserQ

      $scope.reset = () => {
        $scope.userList = []
        $scope.prodList = []
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
        initQ = initFunction()
      }

      $scope.reset()

      $scope.research = () => {
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.selectUser = (user) => {
        $scope.currentUser = user
        $scope.research()
      }

      $scope.selectProd = (prod) => {
        $scope.currentProd = prod
        $scope.research()
      }

      $scope.searcher = (index, size) => {
        if ($scope.refreshing) {return}
        $scope.refreshing = true
        return initQ.then(() => {
          return $scope.ajax('data_get', {
            pageindex: index || $scope.pageIndex,
            pagesize: size || $scope.pageSize,
            isv_user_id: $scope.currentUser.user_id ? $scope.currentUser.user_id : '',
            product_id: $scope.currentProd.product_id ? $scope.currentProd.product_id : '',
            sort_name: 'rx_insertTime',
            sort_flag: '0',
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

      function initFunction () {
        $scope.loading = true
        return $scope.ajax('data_init').then((data) => {
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



      window.test = $scope
      //$scope.$on("$destroy", event => {});
    }]
})
