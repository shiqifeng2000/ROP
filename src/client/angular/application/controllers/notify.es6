/**
 * Created by zhangjj on 11/04/2017.
 */
define(['../../services'], function () {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog',
    ($rootScope, $scope, $q, $http, $mdDialog) => {
      let getTypeQ, getDetailQ
      $scope.typeList = []
      $scope.reset = () => {
        getTypeQ = getType()
        getDetailQ = getDetail()
      }
      $scope.reset()

      $scope.changeType = (type) => {
        if ($scope.loading || $scope.refreshing) {
          return
        }
        $scope.typeList._type = type
        getDetailQ = getDetail()
      }

      $scope.append = (type, selector) => {
        if (type === 'mail') {
          $scope.notifyInfo.mail_list && $scope.notifyInfo.mail_list.push({
            mail: ''
          })
        } else if (type === 'sms') {
          $scope.notifyInfo.mobile_list && $scope.notifyInfo.mobile_list.push({
            mobile: ''
          })
        } else if (type === 'url') {
          $scope.notifyInfo.url_list && $scope.notifyInfo.url_list.push({
            url: ''
          })
        } else {
          return
        }

        let $el = angular.element(selector)
        $el.animate({
          scrollTop: $el[0].scrollHeight
        })
      }


      $scope.splice = (type, index) => {
        if (type === 'mail') {
          $scope.notifyInfo.mail_list && $scope.notifyInfo.mail_list.splice(index, 1)
        } else if (type === 'sms') {
          $scope.notifyInfo.mobile_list && $scope.notifyInfo.mobile_list.splice(index, 1)
        } else if (type === 'url') {
          $scope.notifyInfo.url_list && $scope.notifyInfo.url_list.splice(index, 1)
        }
      }

      $scope.save = () => {
        if ($scope.loading || $scope.refreshing) {
          return
        }
        if ($scope.mailForm.$invalid || $scope.smsForm.$invalid || $scope.urlForm.$invalid) {
          if ($scope.mailForm.$invalid) {
            $scope.mailForm.$error.required && $scope.mailForm.$error.required.forEach(r => {
              r.$setDirty(true)
            })
            $scope.mailForm.$error.maxlength && $scope.mailForm.$error.maxlength.forEach(r => {
              r.$setDirty(true)
            })
            $scope.mailForm.$error.pattern && $scope.mailForm.$error.pattern.forEach(r => {
              r.$setDirty(true)
            })
            $scope.mailForm.$error.email && $scope.mailForm.$error.email.forEach(r => {
              r.$setDirty(true)
            })
          }
          if ($scope.smsForm.$invalid) {
            $scope.smsForm.$error.required && $scope.smsForm.$error.required.forEach(r => {
              r.$setDirty(true)
            })
            $scope.smsForm.$error.maxlength && $scope.smsForm.$error.maxlength.forEach(r => {
              r.$setDirty(true)
            })
            $scope.smsForm.$error.pattern && $scope.smsForm.$error.pattern.forEach(r => {
              r.$setDirty(true)
            })
          }
          if ($scope.urlForm.$invalid) {
            $scope.urlForm.$error.required && $scope.urlForm.$error.required.forEach(r => {
              r.$setDirty(true)
            })
            $scope.urlForm.$error.maxlength && $scope.urlForm.$error.maxlength.forEach(r => {
              r.$setDirty(true)
            })
            $scope.urlForm.$error.pattern && $scope.urlForm.$error.pattern.forEach(r => {
              r.$setDirty(true)
            })
          }
          $rootScope.warn('保存失败，请检查格式是否正确！')
          return
        }
        $scope.loading = true
        return $http.post('/agent', {
          module: 'application',
          partial: 'notify',
          api: 'notify_detail_save',
          param: {
            notify_type_id: $scope.typeList._type.notify_type_id,
            mail_flag: $scope.notifyInfo.mail_flag,
            sms_flag: $scope.notifyInfo.sms_flag,
            url_flag: $scope.notifyInfo.url_flag,
            mail_list: $scope.notifyInfo.mail_list,
            mobile_list: $scope.notifyInfo.mobile_list,
            url_list: $scope.notifyInfo.url_list
          }
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            $rootScope.warn('保存成功!', true)
          } else {
            $rootScope.alert(body.data.msg)
          }
        }).finally(() => {
          $scope.loading = false
        })
      }

      function getType() {
        if ($scope.loading) {
          return
        }
        $scope.loading = true
        return $rootScope.ajax('notify_type_get').then((data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.typeList = data.data_list
            $scope.typeList._type = data.data_list[0]
          } else {
            $rootScope.alert(data.msg)
          }
        }).finally(() => {
          $scope.loading = false
        })
      }

      function getDetail() {
        if ($scope.refreshing) {
          return
        }
        $scope.refreshing = true
        return getTypeQ.then(() => {
          return $rootScope.ajax('notify_detail_get', {
            notify_type_id: $scope.typeList._type && $scope.typeList._type.notify_type_id
          }).then((data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              console.log(data.notify_info)
              $scope.notifyInfo = data.notify_info
            } else {
              $rootScope.alert(data.msg)
            }
          }).finally(() => {
            $scope.refreshing = false
          })
        })
      }



      window.test = $scope
      window.$scope = $scope
      //$scope.$on("$destroy", event => {});
    }
  ]
})
