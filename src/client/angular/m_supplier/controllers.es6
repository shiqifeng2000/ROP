/**
 * Created by robin on 22/11/2016.
 */
/*define(['require', 'clipboard', 'treeview', 'packagetree', 'string2json', '../services'], function (require, Clipboard) {
  'use strict'


})*/

let controllerModule = angular.module('supplier.controllers', [])
controllerModule
  .controller('IndexCtrl', ['$rootScope', '$scope', '$http', '$timeout', '$q', '$injector', ($rootScope, $scope, $http, $timeout, $q, $injector) => {
    $rootScope.tab = 'index'

    $scope.scrollToContent = cb => {
      $('body').animate({scrollTop: $(window).height()}, cb)
    }
    $('a[href^="#"]', '#partials').click(e => {
      e.preventDefault()
    })

    document.body.scrollTop = 0
    $('.transitionEndBubbleStop').off('transitionend')
    $('.transitionEndBubbleStop').bind('transitionend', e => {
      e.stopPropagation()
    })

    let getCatQ = $http.post('/agent', {
      module: 'supplier',
      partial: 'document',
      api: 'get_ssv_cat',
      param: {ssv_user_id: $rootScope.ssv_user_id}
    }).then(body => {
      if (body.data.cat_list && body.data.cat_list.length) {
        $scope.catList = body.data.cat_list
      }
    })
    $rootScope.preloadComplete.finally(() => {
      getCatQ.then($scope.removeLoading)
      $scope.nextTick(() => {
        $scope.bannerSwiper = new Swiper('#banner', {
          pagination: '.swiper-pagination',
          autoplay: 6000,
          speed: 800,
          //direction: 'vertical',
          //slidesPerView: 1,
          paginationClickable: true,
          spaceBetween: 30,
          keyboardControl: true,
          preloadImages: false,
          lazyLoading: true
        })
      })
    })

    $scope.openApi = (api) => {
      // ${Constant.protocol}://${Constant.host}/api/${method}-${id}.html
      window.open(`${Constant.protocol}://${Constant.host}/api/apipreview-${api.api_id}.html`, '_blank')
    }
  }])
  .controller('LoginCtrl', ['$rootScope', '$scope', '$http', '$cookies', '$stateParams',
    ($rootScope, $scope, $http, $cookies, $stateParams) => {
      $rootScope.tab = 'login'
      $scope.contentHeight = `${Math.max($rootScope.screenRect.height, $rootScope.screenRect.width)}px`

      let fromState = $stateParams.fromState || 'index'
      $scope.login = $rootScope.throttle(() => {
        if ($scope.loginForm.$invalid) {
          $scope.loginForm.$error.required && $scope.loginForm.$error.required.forEach(r => {
            r.$setDirty(true)
          })
          //$scope.login_msg = ($rootScope._lang == 'zh-cn') ? '请检查输入项是否正确' : 'Please verify the inputs'
          //rememberMistakes.call();
          return
        }

        let OSName = 'Unknown OS'
        if (navigator.appVersion.indexOf('Win') != -1) OSName = 'Windows'
        if (navigator.appVersion.indexOf('Mac') != -1) OSName = 'MacOS'
        if (navigator.appVersion.indexOf('X11') != -1) OSName = 'UNIX'
        if (navigator.appVersion.indexOf('Linux') != -1) OSName = 'Linux'

        let myParam = {
          user_account: $scope.user_account ? $scope.user_account.trim() : '',
          password: $scope.password ? $scope.password.trim() : '',
          login_system: OSName
        }

        $scope.refreshing = true
        $http.post('/login', {
          /*module: 'sso',
          partial: 'session',
          api: 'login',*/
          param: myParam
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            $rootScope.profile = body.data
            $cookies.put('_session', JSON.stringify(body.data), {
              path: '/',
              domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`
            })
            window.rxStream && window.rxStream.trackSignup(myParam.user_account, 'rop_sign_up', {
              subject: {
                'o_rop_user_name': $rootScope.profile && $rootScope.profile.login_user_name || '',
                'o_rop_user_type': $rootScope.profile && $rootScope.profile.login_user_type && (($rootScope.profile.login_user_type == '2') ? '供应商' : (($rootScope.profile.login_user_type == '1') ? '开发者' : '管理员')) || '',
              }
            })
            //forgetMistakes.call();
            $rootScope.getSystemHints.call()
            $rootScope.go(fromState)
          } else {
            //rememberMistakes.call();
            $scope.login_msg = body.data.msg
            $rootScope.alert(body.data.msg)
          }
        }, why => {
          $scope.login_msg = why
        }).finally(() => {
          $scope.refreshing = false
        })
      }, 800)

      $scope.clearMsg = () => {
        $scope.login_msg = ''
      }
      $scope.toPlatform = $rootScope.toPlatform
      $scope.$on('$viewContentLoaded', $rootScope.removeLoading)
    }])
