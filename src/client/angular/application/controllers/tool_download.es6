/**
 * Created by zhangjj on 24/05/2017.
 */
define(['../../services'], function () {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog',
    ($rootScope, $scope, $q, $http, $mdDialog) => {
      $scope.toolList = []

      $scope.reset = () => {
        $scope.loading = true
        getTool()
      }

      $scope.reset()

      function getTool () {
        $scope.loading = true
        $scope.ajax('list').then(
          (data) => {
            $scope.toolList = data.data_list
          }
        ).finally(() => {
          $scope.loading = false
        })
      }



      window.test = $scope
    }]
})
