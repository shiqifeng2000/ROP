/**
 * Created by zhangjj on 16/02/2017.
 */
define([], function () {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog',
    ($rootScope, $scope, $q, $http, $mdDialog) => {
      $scope.columns = [{
        text: '开发者编码',
        name: 'user_id',
      }, {
        text: '开发者名称',
        name: 'user_name'
      }, {
        text: '配置数量',
        name: 'param_count',
        style: {
          'width': '128px'
        }
      }]
      let initUserQ, getKeyQ
      $scope.reset = () => {
        $scope.userData = []
        $scope.tableUserList = []
        $scope.tableKeyData = []
        $scope.loading = true
        $scope.keyword = ''
        $scope.tableUserList._select = undefined
        initUserQ = initUser()
        getKeyQ = getKeyList()
      }
      $scope.reset()

      $scope.research = () => {
        return initUserQ.then(() => {
          let _select = $scope.tableUserList._select
          $scope.tableUserList = [].concat.apply([], $scope.userData.map(r => ((r.user_name.indexOf($scope.keyword) != -1) ? [r] : [])))
          $scope.tableUserList._select = _select
          return $scope.tableUserList
        })
      }

      $scope.selectUser = user => {
        $scope.tableUserList._select = user
        getKeyQ = getKeyList()
      }

      $scope.keySave = () => {
        $scope.refreshing = true
        $scope.ajax('role_save', {
          isv_user_id: $scope.tableUserList._select && $scope.tableUserList._select.user_id,
          key_list: $scope.tableKeyData.length > 0 ? $scope.tableKeyData : undefined
        }).then(() => {
          getKeyQ = getKeyList()
        }, () => {
          $scope.refreshing = false
        })
      }

      $scope.append = (selector) => {
        $scope.tableKeyData.push({
          key_name: '',
          key_value: ''
        })
        let $el = angular.element(selector)
        $el.animate({
          scrollTop: $el[0].scrollHeight
        })
      }

      $scope.splice = (index) => {
        $scope.tableKeyData.splice(index, 1)
      }

      function getKeyList() {
        $scope.refreshing = true
        return initUserQ.then(() => {
          if ($scope.tableUserList._select && $scope.tableUserList._select.user_id) {
            return $scope.ajax('key_list', {
              isv_user_id: $scope.tableUserList._select.user_id
            }).then(data => {
              $scope.tableKeyData = data.key_list
              $scope.tableUserList._select.param_count = data.key_list.length + ''
              for (let i = 0, length = $scope.userData.length; i < length; i++) {
                if ($scope.userData[i].user_id === $scope.tableUserList._select.user_id) {
                  $scope.userData[i].param_count = data.key_list.length + ''
                  break
                }
              }
              return data
            })
          }
        }).finally(() => {
          $scope.refreshing = false
        })
      }

      function initUser() {
        $scope.loading = true
        return $scope.ajax('user_list').then(data => {
          $scope.userData = data.user_list
          $scope.tableUserList = data.user_list
          // $scope.userData = [];
          // $scope.tableUserList = [];
          if ($scope.tableUserList.length > 0) {
            $scope.tableUserList._select = $scope.tableUserList[0]
          }
          return data
        }).finally(() => {
          $scope.loading = false
        })
      }


      window.test = $scope
    }
  ]
})
