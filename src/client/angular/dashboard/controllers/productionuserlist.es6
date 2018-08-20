/**
 * Created by zhangjj on 22/03/2017.
 */
define(['../../services'], function (cta) {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog',
    ($rootScope, $scope, $q, $http, $mdDialog) => {
      $scope.reset = () => {
        $scope.keyword = ''
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

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
        return $scope.ajax('list', {
          pageindex: index || $scope.pageIndex,
          pagesize: size || $scope.pageSize,
          product_name: $scope.keyword || '',
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
      }
      $scope.reset()



      window.test = $scope
      //$scope.$on("$destroy", event => {});
    }]
})
