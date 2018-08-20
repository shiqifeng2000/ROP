/**
 * Created by robin on 22/11/2016.
 */
/*require.config(Constant.requires)

require(['./sso/app'], () => {
  angular.bootstrap(document, ['sso'])
})*/
let app = angular.module('sso', ['ui.router', 'ngCookies', 'ngMaterial', 'ngMessages', 'sso.controllers','rop.directives', 'rop.filters', 'rop.services'])

app.config(['$provide','$logProvider','$compileProvider', ($provide, $logProvider, $compileProvider) => {
  $logProvider.debugEnabled(false);
  $compileProvider.debugInfoEnabled(false)
}]).config($mdThemingProvider => {
  let customBlueMap = $mdThemingProvider.extendPalette('cyan', {
    'contrastDefaultColor': 'light',
    'contrastDarkColors': ['50'],
    '50': 'ffffff',
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

  $mdThemingProvider.theme('dracular', 'default')
    .primaryPalette('grey', {
      'default': '900',
      'hue-1': '50',
      'hue-2': '800',
      'hue-3': '900'
    }).accentPalette('customBlue')
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
        templateUrl: '/_view/sso/index',
        url: '/sso/home',
        controller: 'IndexCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'index', des: 'ROP SSO模块登录页面'}}],
      }).state('register', {
        templateUrl: '/_view/sso/register',
        url: '/sso/register',
        controller: 'RegisterCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'register', des: 'ROP SSO模块注册页面'}}],
      }).state('registerdev', {
        templateUrl: '/_view/sso/registerdev',
        url: '/sso/registerdev',
        controller: 'RegisterDevCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'registerdev', des: 'ROP SSO模块开发者注册页面'}}],
      }).state('update', {
        templateUrl: '/_view/sso/update',
        url: '/sso/update',
        controller: 'UpdateCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'update', des: 'ROP SSO模块账号修改页面'}}],
      }).state('updatepassword', {
        templateUrl: '/_view/sso/updatepassword',
        url: '/sso/updatepassword',
        controller: 'UpdatepasswordCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'updatepassword', des: 'ROP SSO模块修改密码页面'}}],
      }).state('findpassword', {
        templateUrl: '/_view/sso/findpassword',
        url: '/sso/findpassword',
        controller: 'FindpasswordCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'findpassword', des: 'ROP SSO模块找回密码页面'}}],
      }).state('resetpassword', {
        params: {token: 'shiqifeng2000@gmail.com',},
        templateUrl: '/_view/sso/resetpassword',
        url: '/sso/resetpassword?token',
        controller: 'ResetpasswordCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'resetpassword', des: 'ROP SSO模块重置密码页面'}}],
      }).state('activeuser', {
        params: {code: 'shiqifeng2000@gmail.com'},
        templateUrl: '/_view/sso/activeuser',
        url: '/sso/activeuser?code',
        controller: 'ActiveUserCtrl',
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'activeuser', des: 'ROP SSO模块激活账号页面'}}],
      })
      $urlRouterProvider.otherwise('/sso/home')
      $locationProvider.html5Mode(true)
      $locationProvider.hashPrefix('!')
    }])

app.run(['$rootScope', '$state', '$location', '$window', '$cookies', '$mdDialog', 'ScopeInitializer',
  ($rootScope, $state, $location, $window, $cookies, $mdDialog, ScopeInitializer) => {
    angular.extend($rootScope, ScopeInitializer)
    $rootScope.from = $location.search().from
    $rootScope.message = $location.search().message
    $rootScope.fromProduct = $location.search().fromProduct || $location.search().fromproduct
    //$rootScope.loginMistakes = $cookies.get("_showCaptcha")?3:0;

    let _session = $cookies.get('_session') ? JSON.parse($cookies.get('_session')) : ''
    _session && ($rootScope.profile = _session)

    $rootScope.isAdmin = () => {return $rootScope.profile && (($rootScope.profile.login_user_type == '0') || ($rootScope.profile.login_user_type == '3'))}
    $rootScope.isSsv = () => {return $rootScope.profile && ($rootScope.profile.login_user_type == '2')}
    $rootScope.isIsv = () => {return $rootScope.profile && ($rootScope.profile.login_user_type == '1')}

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

angular.bootstrap(document, ['sso'])
