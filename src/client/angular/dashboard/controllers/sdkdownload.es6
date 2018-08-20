/**
 * Created by zhangjj on 24/05/2017.
 */
define(['../../services'], function () {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog',
    ($rootScope, $scope, $q, $http, $mdDialog) => {
      $scope.sdk = []
      $scope.native = []

      $scope.reset = () => {
        $scope.loading = true
        getSDK()
      }

      $scope.reset()

      function getSDK () {
        $scope.loading = true
        $scope.ajax('list').then(
          (data) => {
            console.log(data)
            let sdk = [], native = []
            data.sdk.forEach((item) => {
              if (item.type === 'js' || item.type === 'android'){
                native.push(item)
              } else {
                sdk.push(item)
              }
            })
            $scope.sdk = sdk
            $scope.native = native
          }
        ).finally(() => {
          $scope.loading = false
        })
      }



      window.test = $scope
    }]
})
