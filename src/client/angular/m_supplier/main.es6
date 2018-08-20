/**
 * Created by robin on 22/11/2016.
 */
require.config(Constant.requires)

let app = angular.module('supplier', ['ui.router', 'ngAnimate', 'ngCookies', 'ngMaterial', 'ngMessages', 'supplier.controllers', 'rop.directives', 'rop.filters', 'rop.services'])

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

  let greyMap1 = $mdThemingProvider.extendPalette('grey', {
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
  }).warnPalette('teal').dark()
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
    })
      .state('login', {
        url: '/supplier/login',
        templateUrl: '/_view/supplier/login',
        params: {
          fromState: 'index',
        },
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        onEnter: ['$rootScope', ($rootScope) => {
          $rootScope.tab = {
            key: 'login',
            des: `ROP供应商${window.ssv_info && window.ssv_info.ssv_name || ''}登录页面`
          }
        }],
        controller: 'LoginCtrl'
      })
    //$urlRouterProvider.when(/aspx/i, '/supplier/API');
    $urlRouterProvider.when(/\/api\/.+\.html/i, '/supplier/document')
    $urlRouterProvider.otherwise('/supplier/home')

    $locationProvider.html5Mode(true)
    $locationProvider.hashPrefix('!')
  }])

app.run(['$rootScope', '$state', '$mdSidenav', '$location', '$window', '$http', '$cookies', '$mdDialog', '$mdUtil', '$mdMedia', '$q', 'ScopeInitializer', ($rootScope, $state, $mdSidenav, $location, $window, $http, $cookies, $mdDialog, $mdUtil, $mdMedia, $q, ScopeInitializer) => {
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
  }, why => {$rootScope.warn(why)}), getSystemHints = () => {
    return $http.post('/agent', {
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
    }, why => {
      $rootScope.alert(why)
    })
  }

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
  $rootScope.toggleSidenav = () => $mdSidenav('right').toggle()
  $rootScope.closeSidenav = (e) => {
    e && (e.stopPropagation())
    return $mdSidenav('right').close()
  }
  $rootScope.toggleLogin = () => {
    if (!$rootScope.profile) {
      $rootScope.selectedSidenavFunc = ($rootScope.selectedSidenavFunc ? 0 : 1)
    }
    //md-selected="selectedIndex"
  }
  $rootScope.toLogin = (from) => $rootScope.go('login', {fromState: from})

  $rootScope.init = () => {
    // 这里是session管理
    let _session = $cookies.get('_session') ? JSON.parse($cookies.get('_session')) : '',
      id = document.querySelector('meta[name=session]').content
    if (_session && (id == _session.id)) {
      $rootScope.profile = _session
      $rootScope.preloadingPromise.then(getSystemHints)
    } else {
      window.rxStream && window.rxStream.userIdentify()
      $cookies.remove('_session', {path: '/', domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`})
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
  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    $mdSidenav('right').close()
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
angular.bootstrap(document, ['supplier'])
