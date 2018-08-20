/**
 * Created by zhangjj on 24/05/2017.
 */
define(['../../services'], function () {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog',
    ($rootScope, $scope, $q, $http, $mdDialog) => {
      $scope.sdk = []
      $scope.sdkbeta = []
      $scope.native = []

      $scope.reset = () => {
        $scope.loading = true
        getSDK()
      }

      $scope.reset()

      $scope.create_sdkbeta = () => {
        $scope.refreshing = true
        $scope.ajax('create_sdkbeta').then((data) => {
          $rootScope.alert('测试版SDK已开始生成，请稍后')
        }).finally(() => {
          $scope.refreshing = false
        })
      }

      function getSDK () {
        $scope.loading = true
        $scope.ajax('list').then(
          (data) => {
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
            $scope.sdkbeta = data.sdkbeta
          }
        ).finally(() => {
          $scope.loading = false
        })
      }



      window.test = $scope
    }]
})
