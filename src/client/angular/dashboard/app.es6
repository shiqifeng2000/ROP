/**
 * Created by robin on 22/11/2016.
 */

define([
  'bootstrap',
  'common',

  'angularLoad',
  //'angularDNDL',

  './controllers',
  './services',
  '../directives',
  '../filters',
  '../services',
], () => {
  'use strict'
  let app = angular.module('dashboard', ['ui.router', 'ngAnimate', 'ngCookies', 'ngMaterial', 'ngMessages', 'dashboard.controllers', 'dashboard.services', 'rop.directives', 'rop.filters', 'rop.services', 'oc.lazyLoad'])
  app.config($mdThemingProvider => {
    let customBlueMap = $mdThemingProvider.extendPalette('cyan', {
      'contrastDefaultColor': 'light',
      'contrastDarkColors': ['50'],
      '50': 'ffffff',
      '100': '70e1d0',
      '300': '00C8AB',
      '500': '00C5A3',
      '800': '00A589',
      'A100': 'EEFCFF'
    })
    $mdThemingProvider.definePalette('customBlue', customBlueMap)
    $mdThemingProvider.theme('default')
      .primaryPalette('customBlue', {
        'default': '500',
        'hue-1': '50',
        'hue-2': '800',
        'hue-3': 'A100'
      })
      .accentPalette('pink')

    let greyMap = $mdThemingProvider.extendPalette('grey', {
      'contrastDefaultColor': 'dark',
      'contrastDarkColors': ['50'],
      'contrastLightColors': ['300', '500', '800', 'A100'],
      '50': 'FFFFFF',
      '300': '35383B',
      '500': '2b2b2b',
      '800': '212121',
      'A100': '000000'
    })

    $mdThemingProvider.definePalette('amazingPaletteName', greyMap)
    $mdThemingProvider.theme('dracular').primaryPalette('amazingPaletteName', {
      'default': '500',
      'hue-1': '50',
      'hue-2': '300',
      'hue-3': '800'
    })
  })
    .config(($mdIconProvider, $mdDateLocaleProvider) => {
      $mdIconProvider
        .iconSet('action', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-action.svg', 24)
        .iconSet('alert', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-alert.svg', 24)
        .iconSet('av', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-av.svg', 24)
        .iconSet('communication', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-communication.svg', 24)
        .iconSet('content', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-content.svg', 24)
        .iconSet('device', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-device.svg', 24)
        .iconSet('editor', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-editor.svg', 24)
        .iconSet('file', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-file.svg', 24)
        .iconSet('hardware', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-hardware.svg', 24)
        .iconSet('image', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-image.svg', 24)
        .iconSet('maps', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-maps.svg', 24)
        .iconSet('navigation', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-navigation.svg', 24)
        .iconSet('notification', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-notification.svg', 24)
        .iconSet('social', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-social.svg', 24)
        .iconSet('toggle', '/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-toggle.svg', 24)

        .defaultIconSet('/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-action.svg', 24)

      $mdDateLocaleProvider.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      $mdDateLocaleProvider.shortMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      $mdDateLocaleProvider.shortDays = $mdDateLocaleProvider.days = ['日', '一', '二', '三', '四', '五', '六']
      $mdDateLocaleProvider.monthHeaderFormatter = date => {return date.getFullYear() + '年 ' + $mdDateLocaleProvider.months[date.getMonth()]}
      $mdDateLocaleProvider.msgCalendar = '日历表'
    })
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$urlMatcherFactoryProvider', ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $urlMatcherFactoryProvider) => {
      $urlMatcherFactoryProvider.caseInsensitive(true)
      $urlMatcherFactoryProvider.strictMode(false)
      $stateProvider.state('appList', {
        templateUrl: '/_view/dashboard/applist',
        controller: 'AppListCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/isv/AppList',
      })
        .state('cautionList', {
          templateUrl: '/_view/dashboard/cautionlist',
          controller: 'CautionListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/CautionList',
        })
        .state('ipWhiteList', {
          templateUrl: '/_view/dashboard/ipwhitelist',
          controller: 'IpWhiteListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/IpWhiteList'
        })
        .state('domainWhiteList', {
          templateUrl: '/_view/dashboard/domainwhitelist',
          controller: 'DomainWhiteListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/DomainWhiteList',
        })
        .state('userMailList', {
          templateUrl: '/_view/dashboard/usermaillist',
          controller: 'UserMailListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/UserMailList',
        })
        .state('appCompanyList', {
          templateUrl: '/_view/dashboard/appcompanylist',
          controller: 'AppCompanyListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/AppCompanyListList',
        })
        .state('appApiAssistIsvSandbox', {
          templateUrl: '/_view/dashboard/appapiassistisvsandbox',
          controller: 'AppApiAssistIsvSandboxCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/statistics/AppApiAssistIsvSandbox',
        })
        .state('appApiAssistIsv', {
          templateUrl: '/_view/dashboard/appapiassistisv',
          controller: 'AppApiAssistIsvCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/statistics/AppApiAssistIsv',
        })
        .state('logAnalyzeSandbox', {
          templateUrl: '/_view/dashboard/loganalyzesandbox',
          controller: 'LogAnalyzeSandboxCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/statistics/LogAnalyzeSandbox',
        })
        .state('logAnalyze', {
          templateUrl: '/_view/dashboard/loganalyze',
          controller: 'LogAnalyzeCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/statistics/LogAnalyze',
        })
        .state('logAnalyzeSandboxNew', {
          templateUrl: '/_view/dashboard/loganalyzesandboxnew',
          controller: 'LogAnalyzeSandboxNewCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/statistics/LogAnalyzeSandboxNew',
        })
        .state('logAnalyzeNew', {
          templateUrl: '/_view/dashboard/loganalyzenew',
          controller: 'LogAnalyzeNewCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/statistics/LogAnalyzeNew',
        })
        .state('downloadList', {
          templateUrl: '/_view/dashboard/downloadlist',
          controller: 'DownloadListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/DownloadList',
        })
        .state('SdkDownload', {
          templateUrl: '/_view/dashboard/sdkdownload',
          controller: 'SdkDownloadCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/SdkDownload',
        })
        .state('IsvNoticeList', {
          templateUrl: '/_view/dashboard/isvnoticelist',
          controller: 'IsvNoticeListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/IsvNoticeList',
        })
        .state('smsRechargeList', {
          templateUrl: '/_view/dashboard/smsrechargelist',
          controller: 'SmsRechargeListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/SmsRechargeList',
        })
        .state('smsBalanceList', {
          templateUrl: '/_view/dashboard/smsbalancelist',
          controller: 'SmsBalanceListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/SmsBalanceList',
        })
        .state('smsSendList', {
          templateUrl: '/_view/dashboard/smssendlist',
          controller: 'SmsSendListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/SmsSendList',
        })
        .state('smsUserTemplateList', {
          templateUrl: '/_view/dashboard/smsusertemplatelist',
          controller: 'SmsUserTemplateListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/SmsUserTemplateList',
        })
        .state('subUserList', {
          templateUrl: '/_view/dashboard/subuserlist',
          controller: 'SubUserListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/SubUserList',
        })
        .state('productuserlist', {
          templateUrl: '/_view/dashboard/productuserlist',
          controller: 'ProductUserListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/ProductUserList',
        })
        .state('productchargelist', {
          templateUrl: '/_view/dashboard/productchargelist',
          controller: 'ProductChargeListCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
          url: '/isv/ProductChargeList',
        })
        .state('frame', {
          params: {
            src: ''
          },
          templateUrl: '/_view/dashboard/frame',
          controller: 'FrameCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        })
        .state('error', {
          params: {
            error: ''
          },
          templateUrl: '/_view/dashboard/error',
          controller: 'ErrorCtrl',
          resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        })
      $urlRouterProvider.otherwise('/isv/AppList')
      $locationProvider.html5Mode(true)
      $locationProvider.hashPrefix('!')

      $httpProvider.interceptors.push('HttpObserver')
    }])

  app.run(['$rootScope', '$state', '$location', '$window', '$http', '$cookies', '$mdDialog', '$mdUtil', '$mdMedia', '$q', '$timeout', 'ScopeInitializer', 'LogProcessor', ($rootScope, $state, $location, $window, $http, $cookies, $mdDialog, $mdUtil, $mdMedia, $q, $timeout, ScopeInitializer, LogProcessor) => {
    $rootScope.nav_menu = {}

    ScopeInitializer.contextSelector = 'body>section>md-content'
    angular.extend($rootScope, ScopeInitializer)
    $rootScope.logout = () => ScopeInitializer.logout(() => {ScopeInitializer.toPlatform('sso?from=dashboard')})
    $rootScope.minify = () => {return !$mdMedia('(min-width: 1400px)')}
    $rootScope.mini = $rootScope.minify()
    $rootScope.toggleMini = () => {$rootScope.mini = !$rootScope.mini}
    $rootScope.isIsv = () => {return $rootScope.profile && ($rootScope.profile.login_user_type == '1')}
    $rootScope.showLog = LogProcessor.showLog
    let loadingQ;
    $rootScope.validateEntry = (reload) => {
      var defer = $q.defer()
      if (!$rootScope.checkSession()) {
        $rootScope.quitSession('dashboard')
        return defer.promise
      }
      navQ.then(() => {
        !loadingQ && (loadingQ = $rootScope.removeLoading())
        return loadingQ
      }).then(() => {
        if ($rootScope.nav_menu && $rootScope.nav_menu.func_list && $rootScope.nav_menu.func_list.length) {
          let unknownEntry = true, isOld = true
          for (let i = 0; i < $rootScope.nav_menu.func_list.length; i++) {
            for (let j = 0; j < $rootScope.nav_menu.func_list[i].sub_func_list.length; j++) {
              var sub_class_name = $rootScope.nav_menu.func_list[i].sub_func_list[j].sub_class_name
              if ((sub_class_name ? sub_class_name.toLowerCase() : '') == $location.path().toLowerCase().replace('/', '')) {
                $rootScope.toggleSubEntry($rootScope.nav_menu.func_list[i], j, reload)
                unknownEntry = false
                isOld = ($rootScope.nav_menu.func_list[i].sub_func_list[j].func_flag != '1')
              }
            }
          }
          if (($rootScope.nav_menu._entry === undefined) && unknownEntry) {
            $rootScope.toggleEntry(-1)
            $rootScope.go('error', {error: '没有访问此页面的权限，请联系管理员，E011'})
            defer.reject('没有访问此页面的权限')
          } else if ($rootScope.profile.login_user_status == '0') {
            $rootScope.go('error', {error: '用户尚未审核，无法访问页面'})
            defer.reject('没有访问此页面的权限')
          } else {
            defer.resolve(isOld)
          }
        } else {
          defer.reject('菜单初始化失败')
        }
      })
      return defer.promise
    }
    $rootScope.toggleEntry = (index) => {$rootScope.nav_menu && ($rootScope.nav_menu._entry = (($rootScope.nav_menu._entry == index) ? -1 : index))}
    $rootScope.isEntryActive = (index) => {return $rootScope.nav_menu && ($rootScope.nav_menu._entry == index)}
    $rootScope.toggleSubEntry = (func, index, reload) => {
      let url = ''
      if ($rootScope.nav_menu) {
        let _entry = $rootScope.nav_menu.func_list && $rootScope.nav_menu.func_list.length ? $rootScope.nav_menu.func_list.indexOf(func) : 0;
        ($rootScope.nav_menu._entry != _entry) && ($rootScope.nav_menu._entry = _entry)
        $rootScope.nav_menu._subEntry = $rootScope.nav_menu._entry + String(index)
        $rootScope.nav_menu.entry = $rootScope.nav_menu.func_list ? $rootScope.nav_menu.func_list[$rootScope.nav_menu._entry] : undefined
        let subFunc = $rootScope.nav_menu.func_list && $rootScope.nav_menu.entry.sub_func_list[index]
        $rootScope.nav_menu.subEntry = subFunc
        subFunc && (url = subFunc.sub_class_name.replace(/^([^\/])/, '/$1'))
        if (url != $location.path()) {
          $location.path(url)
        } else {
          reload && $state.current.name && $rootScope.reload()
        }
      }
    }
    $rootScope.isSubEntryActive = (func, index) => {return $rootScope.nav_menu && ($rootScope.nav_menu._subEntry == (($rootScope.nav_menu.func_list && $rootScope.nav_menu.func_list.length ? $rootScope.nav_menu.func_list.indexOf(func) : 0) + String(index)))}
    $rootScope.getSystemHints = () => {
      var source = new EventSource('/sse/common/tips')
      source.onmessage = (e) => {
        if (window._lastHttpRequest && ((window._lastHttpRequest.getTime() + Constant.exipration) < new Date().getTime())) {
          //$rootScope.locate('sso?from=dashboard');
          $rootScope.quitSession('dashboard')
          return
        }
        var body = JSON.parse(e.data)
        if (body._closeSSE) {
          source.close()
          return
        }
        if (body._skipSSE) {
          return
        }
        if (((typeof body.is_success == 'boolean') && body.is_success) || ((typeof body.is_success == 'string') && (body.is_success == 'true'))) {
          $rootScope.systemHints = body.data_list
        } else {
          source.close()
        }
        $rootScope.$apply()
      }
      /*source.onerror = e=>{console.log(e);console.log(new Date())}
       source.onopen = e=>{console.log(e);console.log(new Date())}*/
      window.addEventListener('beforeunload', (event) => {
        source.close()
      })
    }
    $rootScope.toggleHintPanel = (e) => {
      $rootScope._showHint = !$rootScope._showHint
    }
    $rootScope.closeHintPanel = () => {
      $rootScope._showHint = false
    }
    $rootScope.checkSession = () => {
      let _session = $cookies.get('_session') ? JSON.parse($cookies.get('_session')) : '';
      (_session && !$rootScope.profile && (document.querySelector('meta[name=session]').content == _session.id)) && ($rootScope.profile = _session)
      if (!_session || !$rootScope.profile || !$rootScope.isIsv()) {
        $rootScope.profile = undefined
        $cookies.remove('_session', {path: '/', domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`})
        window.rxStream && window.rxStream.userIdentify()
        return false
      }
      return true
    }

    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
      $mdDialog.hide()
    })

    let navQ
    $rootScope.preloadingPromise.then(() => {
      navQ = $http.post('/agent', {module: 'dashboard', partial: 'common', api: 'nav_menu'}).then(body => {
        if ((((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) && (body.data.func_list && body.data.func_list.length)) {
          angular.extend($rootScope.nav_menu, body.data)
          return body.data
        } else {
          // TODO 左边栏如果不能成功刷出，所有后台应用则无意义
          $rootScope.logout()
          return $q.reject()
        }
      }, why => {
        $rootScope.alert(why)
        $rootScope.logout()
        return $q.reject()
      }).then(() => {
        $rootScope.getSystemHints()
      })
    })

    window.addEventListener('message', e => {
      if (e.data == 'expired') {
        $rootScope.quitSession('dashboard')
      }
    })
  }])

  return app
})
