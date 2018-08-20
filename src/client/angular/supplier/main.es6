/**
 * Created by robin on 22/11/2016.
 */
/*require.config(Constant.requires)

 require(['./supplier/app'], () => {
 angular.bootstrap(document, ['supplier'])
 })*/

let app = angular.module('supplier', ['ui.router', 'ngAnimate', 'ngCookies', 'ngMaterial', 'ngMessages', 'supplier.controllers', 'rop.directives', 'rop.filters', 'rop.services'])

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
      'hue-1': '300',
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
}).config($mdIconProvider => {
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
}).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider',
  ($stateProvider, $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) => {
    $urlMatcherFactoryProvider.caseInsensitive(true)
    $urlMatcherFactoryProvider.strictMode(false)
    $stateProvider.state('index', {
      templateUrl: '/_view/supplier/index',
      url: '/supplier/home',
      controller: 'IndexCtrl',
      resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
      onEnter: ['$rootScope', ($rootScope) => {
        $rootScope.tab = {
          key: 'index',
          des: `ROP供应商${window.ssv_info && window.ssv_info.ssv_name || ''}主页面`
        }
      }],
    }).state('document', {
      //abstract: true,
      url: '/supplier/document',
      templateUrl: '/_view/supplier/document',
      controller: 'DocumentCtrl',
      resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
      onEnter: ['$rootScope', ($rootScope) => {
        $rootScope.tab = {
          key: 'document',
          des: `ROP供应商${window.ssv_info && window.ssv_info.ssv_name || ''}文档页面`
        }
      }],
    }).state('document.api', {
      templateUrl: '/_view/supplier/api',
      url: '/api/:id',
      params: {id: '', cat_id: '', cat_name: ''},
      controller: 'APICtrl',
      resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
      onEnter: ['$rootScope', ($rootScope) => {
        $rootScope.tab = {
          key: 'document',
          des: `ROP供应商${window.ssv_info && window.ssv_info.ssv_name || ''}文档页面`
        }
      }],
    }).state('document.domain', {
      templateUrl: '/_view/supplier/domain',
      url: '/domain/:id',
      params: {id: '', cat_id: '', cat_name: '', sub_domain: false},
      controller: 'DomainCtrl',
      resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
      onEnter: ['$rootScope', ($rootScope) => {
        $rootScope.tab = {
          key: 'document',
          des: `ROP供应商${window.ssv_info && window.ssv_info.ssv_name || ''}文档页面`
        }
      }],
    }).state('function', {
      templateUrl: '/_view/supplier/function',
      url: '/supplier/function',
      controller: 'FunctionCtrl',
      resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
      onEnter: ['$rootScope', ($rootScope) => {
        $rootScope.tab = {
          key: 'function',
          des: `ROP供应商${window.ssv_info && window.ssv_info.ssv_name || ''}功能页面`
        }
      }],
    }).state('info', {
      templateUrl: '/_view/supplier/info',
      url: '/supplier/info',
      controller: 'InfoCtrl',
      resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
      onEnter: ['$rootScope', ($rootScope) => {
        $rootScope.tab = {
          key: 'info',
          des: `ROP供应商${window.ssv_info && window.ssv_info.ssv_name || ''}功能页面`
        }
      }],
    }).state('all-comment', {
      templateUrl: '/_view/supplier/all-comment',
      url: '/supplier/all-comment',
      controller: 'AllCommentCtrl',
      resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
      onEnter: ['$rootScope', ($rootScope) => {
        $rootScope.tab = {
          key: 'allComment',
          des: `ROP供应商${window.ssv_info && window.ssv_info.ssv_name || ''}评论页面`
        }
      }],
    })
    //$urlRouterProvider.when(/aspx/i, '/supplier/API');
    $urlRouterProvider.when(/\/api\/.+\.html/i, '/supplier/document')
    $urlRouterProvider.otherwise('/supplier/home')

    $locationProvider.html5Mode(true)
    $locationProvider.hashPrefix('!')
  }])

app.run(['$rootScope', '$state', '$location', '$window', '$http', '$cookies', '$mdDialog', '$mdUtil', '$mdMedia', '$q', 'ScopeInitializer', ($rootScope, $state, $location, $window, $http, $cookies, $mdDialog, $mdUtil, $mdMedia, $q, ScopeInitializer) => {
  $rootScope.nav_menu = {}
  angular.extend($rootScope, ScopeInitializer)
  $rootScope.logout = () => {
    return ScopeInitializer.logout(() => {
      $rootScope.profile = undefined
    })
  }

  $rootScope.ssv_user_id = $location.search().ssv_user_id
  $rootScope.loginMistakes = 0
  $rootScope._timestamp = new Date().getTime()

  let getCarousels = () => {
    return $http.post('/agent', {
      module: 'supplier',
      partial: 'index',
      api: 'carousels',
      param: {ssv_user_id: $rootScope.ssv_user_id}
    }).then(body => {
      if (body.data.data_list && body.data.data_list.length) {
        $rootScope.carousels = body.data.data_list
      } else {
        $rootScope.carousels = [{
          'image_title': '<span style=\'color: white\'>融数供应商</span>',
          'image_desc': '<span style=\'color: gray\'>融数供应商描述</span>',
          'image_url': '/resource/supplier/mr1.jpg',
          'image_link': ''
        }, {
          'image_title': '<span style=\'color: white\'>融数供应商</span>',
          'image_desc': '<span style=\'color: gray\'>融数供应商描述</span>',
          'image_url': '/resource/supplier/mr2.jpg',
          'image_link': ''
        }]
      }
    }, why => {
      $rootScope.warn(why)
      //$rootScope.alert(why);
    })
  }, getIntro = cb => {
    return $http.post('/agent', {
      module: 'supplier',
      partial: 'index',
      api: 'ssv_intro',
      param: {ssv_user_id: $rootScope.ssv_user_id}
    }).then(body => {
      $rootScope.ssv_intro = body.data
      cb && cb.call()
    }, why => {
      $rootScope.warn(why)
    })
  }, getInfo = () => $http.post('/agent', {
    module: 'supplier',
    partial: 'index',
    api: 'get_info',
    param: {ssv_user_id: $rootScope.ssv_user_id}
  }).then(body => {
    body.data && ($rootScope.user_info = body.data.user_info)
  }, why => {$rootScope.warn(why)})

  // 收藏，暂时注掉
  $rootScope.favor = () => {
    $http.post('/agent', {
      module: 'supplier',
      partial: 'session',
      api: 'favor',
      param: {ssv_user_id: $rootScope.ssv_user_id}
    }).then(body => {
      if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
        !$rootScope.ssv_intro && ($rootScope.ssv_intro = {})
        $rootScope.ssv_intro.favo_status = '1'
        //$('#favorSuccess').modal('show');
      } else {
        $rootScope.alert(body.data)
      }
    }, why => {
      $rootScope.alert(why)
    })
  }

  // 申请，暂时注掉
  $rootScope.request = () => {
    $http.post('/agent', {
      module: 'supplier',
      partial: 'session',
      api: 'request',
      param: {ssv_user_id: $rootScope.ssv_user_id}
    }).then(body => {
      if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
        !$rootScope.ssv_intro && ($rootScope.ssv_intro = {})
        $rootScope.ssv_intro.apply_status = '2'
      } else {
        $rootScope.alert(body.data)
      }
    }, why => {
      $rootScope.alert(why)
    })
  }

  $rootScope.scrollToTop = cb => {
    if (ScopeInitializer.browserType == 'Firefox') {angular.element('html').animate({scrollTop: 0}, cb)} else {angular.element('body').animate({scrollTop: 0}, cb)}
  }
  /*$rootScope.isAdmin = () => {$rootScope.profile && (($rootScope.profile.login_user_type == '0') || ($rootScope.profile.login_user_type == '3')) ? true:false;}*/
  $rootScope.isAdmin = () => {
    return $rootScope.profile && (($rootScope.profile.login_user_type == '0') || ($rootScope.profile.login_user_type == '3'))
  }
  $rootScope.isSsv = () => {
    return $rootScope.profile && ($rootScope.profile.login_user_type == '2')
  }
  $rootScope.isIsv = () => {
    return $rootScope.profile && ($rootScope.profile.login_user_type == '1')
  }
  $rootScope.toConsole = () => {
    if ($rootScope.isSsv()) {
      $rootScope.toPlatform('application')
    } else if ($rootScope.isAdmin()) {
      $rootScope.toPlatform('console')
    } else if ($rootScope.isIsv) {
      $rootScope.toPlatform('dashboard')
    }
  }

  $rootScope.init = () => {
    // 这里是session管理
    let _session = $cookies.get('_session') ? JSON.parse($cookies.get('_session')) : '',
      id = document.querySelector('meta[name=session]').content
    if (_session && (id == _session.id)) {
      $rootScope.profile = _session
      $rootScope.preloadingPromise.then($rootScope.getSystemHints)
    } else {
      $cookies.remove('_session', {path: '/', domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`})
      window.rxStream && window.rxStream.userIdentify()
      $rootScope.profile = undefined
    }

    // 这里是初始化数据管理
    /*let _info,_info_content = document.querySelector("meta[name=info]").content;
     try {_info = JSON.parse(_info_content);} catch (e) {_info = undefined;}
     */
    if (window.ssv_info) {
      $rootScope.ssv_user_id = window.ssv_info.ssv_id
      $rootScope.ssv_info = window.ssv_info
      $rootScope.preloadComplete = $rootScope.preloadingPromise.then(getInfo).then(() => {
        window.ssv_info.method && $rootScope.go(`document.${window.ssv_info.method}`, {
          id: window.ssv_info.id,
          cat_id: window.ssv_info.cat_id,
          cat_name: window.ssv_info.cat_name
        })
      })
    } else {
      $rootScope.toPlatform('/')
    }
  }

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
angular.bootstrap(document, ['supplier'])
