/**
 * Created by robin on 22/11/2016.
 */
require.config(Constant.requires)

/**
 * Created by robin on 22/11/2016.
 */

/*
 define([
 'bootstrap',
 'common',

 './welcome/controllers',
 './directives',
 './filters',
 './services'
 ], () => {
 return app
 })
 */

'use strict'
let app = angular.module('welcome', ['ui.router', 'ngAnimate', 'ngCookies', 'ngMessages', 'ngMaterial', 'welcome.controllers', 'rop.directives', 'rop.filters', 'rop.services'])

app.config(['$provide','$logProvider','$compileProvider', ($provide, $logProvider, $compileProvider) => {
  $logProvider.debugEnabled(false);
  $compileProvider.debugInfoEnabled(false)
}]).config($mdThemingProvider => {
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
    'contrastDefaultColor': 'light',
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
  }).dark()

  /*let greyMap1 = $mdThemingProvider.extendPalette('grey', {
   'contrastDefaultColor': 'light',
   'contrastDarkColors': ['50'],
   'contrastLightColors': ['300', '500', '800', 'A100'],
   '50': 'FFFFFF',
   '300': '35383B',
   '500': 'FAFAFA',
   '800': '212121',
   'A100': '000000'
   })

   $mdThemingProvider.definePalette('amazingPaletteName1', greyMap1)
   $mdThemingProvider.theme('cooler').primaryPalette('amazingPaletteName1', {
   'default': '50',
   'hue-1': '50',
   'hue-2': '300',
   'hue-3': '800'
   }).warnPalette("teal").dark();*/

})
  .config($mdIconProvider => {
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
  })
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider',
    ($stateProvider, $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) => {
      $urlMatcherFactoryProvider.caseInsensitive(true)
      $urlMatcherFactoryProvider.strictMode(false)
      $stateProvider.state('index', {
        templateUrl: '/_view/welcome/index',
        url: '/welcome/home',
        controller: 'IndexCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'index', des: 'ROP移动版主页面'}}],
        onExit: [() => {
          window.swiper && (window.swiper.stopAutoplay())
          angular.element(window).unbind('scroll')
        }]
      }).state('suppliers', {
        templateUrl: '/_view/welcome/suppliers',
        url: '/welcome/suppliers',
        controller: 'SuppliersCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'suppliers', des: 'ROP移动版供应商一览页面'}}],
      }).state('document', {
        //abstract: true,
        url: '/welcome/document',
        templateUrl: '/_view/welcome/document',
        controller: 'DocCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'document', des: 'ROP移动版开发者文档页面'}}],
      }).state('document.details', {
        url: '/:id',
        params: {id: ''},
        templateUrl: '/_view/welcome/document-details',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'document', des: 'ROP移动版开发者文档页面'}}],
        controller: 'DocDetailCtrl'
      }).state('login', {
        url: '/welcome/login',
        templateUrl: '/_view/welcome/login',
        params: {fromState: 'index',},
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'login', des: 'ROP移动版登录页面'}}],
        controller: 'LoginCtrl'
      }).state('features', {
        url: '/welcome/features',
        templateUrl: '/_view/welcome/features',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'features', des: 'ROP移动版特性介绍页面'}}],
        controller: 'FeaturesCtrl'
      }).state('services', {
        url: '/welcome/services',
        templateUrl: '/_view/welcome/services',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'services', des: 'ROP移动版帮助中心页面'}}],
        controller: 'ServicesCtrl',
      }).state('search', {
        url: '/welcome/search',
        templateUrl: '/_view/welcome/search',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'search', des: 'ROP移动版搜索页面'}}],
        controller: 'SearchCtrl'
      }).state('debugTool', {
        params: {key: ''},
        url: '/welcome/debugTool',
        templateUrl: '/_view/welcome/debugtool',
        controller: 'DebugToolCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'debugtool', des: 'ROP移动版调试工具页面'}}],
        onExit: [() => {
          window.removeEventListener('message', window._messageListener)
          delete window._messageListener
        }]
      }).state('sdkTool', {
        url: '/welcome/sdkTool',
        templateUrl: '/_view/welcome/sdktool',
        controller: 'SDKToolCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'sdktool', des: 'ROP移动版SDK下载页面'}}],
      }).state('API', {
        url: '/welcome/API',
        templateUrl: '/_view/welcome/api',
        controller: 'APICtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'api', des: 'ROP移动版api一览页面'}}],
      })
      $urlRouterProvider.otherwise('/welcome/home')
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: true
      })
      $locationProvider.hashPrefix('!')
    }])

app.run(['$rootScope', '$state', '$mdSidenav', '$window', '$http', '$location', '$cookies', 'ScopeInitializer', '$timeout', ($rootScope, $state, $mdSidenav, $window, $http, $location, $cookies, ScopeInitializer, $timeout) => {
  document.body.scrollTop = 0
  angular.extend($rootScope, ScopeInitializer)
  $rootScope.logout = () => {return ScopeInitializer.logout(() => {$rootScope.profile = undefined})}
  let getSystemHints = () => {
    $http.post('/agent', {
      module: 'common',
      partial: 'common',
      api: 'tips'
    }).then(body => {
      if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
        $rootScope.systemHints = body.data.data_list
      } else {
        //$rootScope.alert(body.data.msg);
        $rootScope.warn(body.data.msg)
      }
    }, $rootScope.alert)
  }

    // 跳转到快速审核页面
    $rootScope.isProd = () => window.Constant.host.indexOf('rongcapital') != -1


  $rootScope.switchLang = locale => {
    if ($rootScope._lang != locale) {
      $cookies.put('_lang', locale, {domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`})
      $rootScope.locate('/')
    }
  }
  $rootScope.locator = (e, hash) => {
    e.preventDefault()
    e.stopPropagation();
    ((getBrowserType() == 'Firefox') ? $('body,html') : $('body')).animate({scrollTop: $(hash).offset().top})
  }
  $rootScope.isAdmin = () => {return $rootScope.profile && (($rootScope.profile.login_user_type == '0') || ($rootScope.profile.login_user_type == '3'))}
  $rootScope.isSsv = () => {return $rootScope.profile && ($rootScope.profile.login_user_type == '2')}
  $rootScope.isIsv = () => {return $rootScope.profile && ($rootScope.profile.login_user_type == '1')}

  $rootScope.selectedSidenavFunc = 0
  $rootScope.toggleSidenav = () => $mdSidenav('right').toggle()
  $rootScope.closeSidenav = (e) => {
    //e && (e.stopPropagation())
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    return $mdSidenav('right').close()
  }
  $rootScope.toggleLogin = () => {
    if (!$rootScope.profile) {
      $rootScope.selectedSidenavFunc = ($rootScope.selectedSidenavFunc ? 0 : 1)
    }
    //md-selected="selectedIndex"
  }
  $rootScope.toLogin = (from) => $rootScope.go('login', {fromState: from})
  let _session = $cookies.get('_session') ? JSON.parse($cookies.get('_session')) : '',
    id = document.querySelector('meta[name=session]').content
  if (_session && (id == _session.id)) {
    $rootScope.profile = _session
    $rootScope.preloadingPromise.then(getSystemHints)
  } else {
    $cookies.remove('_session', {path: '/', domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`})
    window.rxStream && window.rxStream.userIdentify()
    $rootScope.profile = undefined
  }

  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    $mdSidenav('right').close()
  })

  let shiftOrientation = () => {
    if (window.screen && window.screen.orientation && (typeof window.screen.orientation.angle == 'number') && (window.screen.orientation.angle != 0)) {
      $rootScope.orientation = 'landscape'
    } else {
      $rootScope.orientation = 'portrait'
    }
  }
  shiftOrientation()

  $rootScope.hasBackdrop = () => {
    var result = false
    try {
      result = $mdSidenav('right').isOpen()
    } catch (e) {}
    return result
  }
  window.addEventListener('orientationchange', (a) => {
    shiftOrientation()
    $mdSidenav('right').close()
    $rootScope.$digest()
  })

  $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    window.rxStream && window.rxStream.track('rop_page_click', {
      properties: {
        'b_rop_page_name': $rootScope.tab && $rootScope.tab.des || '未知页面',
        'b_rop_login_status': ($rootScope.profile != undefined),
        'b_rop_login_user': $rootScope.profile && $rootScope.profile.login_user_name || ''
      }
    })
  })
}])

angular.bootstrap(document, ['welcome'])
