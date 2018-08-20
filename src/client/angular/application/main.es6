/**
 * Created by robin on 22/11/2016.
 */
//require.config(Constant.requires)
let app = angular.module('application', ['ui.router', 'ngAnimate', 'ngCookies', 'ngMaterial', 'ngMessages', 'application.controllers', 'application.services', 'rop.directives', 'rop.filters', 'rop.services', 'oc.lazyLoad', 'rop.material.components.menu'])
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
    $stateProvider
      .state('api', {
        templateUrl: '/_view/application/api',
        controller: 'APICtrl',
        params: {api_name: ''},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'api', des: 'API列表页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/ApiList'
      })
      .state('domain', {
        templateUrl: '/_view/application/domain',
        controller: 'DomainCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'domain', des: '结构列表页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/ApiDomainList'
      })
      .state('app', {
        templateUrl: '/_view/application/app',
        controller: 'AppCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'app', des: '供应商账号页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/AppList',
      })
      .state('isvApp', {
        templateUrl: '/_view/application/isv_app',
        controller: 'ISVAppCtrl',
        params: {user_id: '', app_id: ''},
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'isv_app', des: '开发者应用列表页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/IsvAppList',
      })
      .state('envList', {
        templateUrl: '/_view/application/env_list',
        controller: 'EnvironmentCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'env', des: '多环境列表页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/EnvironmentList',
      })
      .state('envApp', {
        templateUrl: '/_view/application/env_app',
        controller: 'EnvironmentAppCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'env_app', des: '开发者多环境设置页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/EnvironmentApp',
      })
      .state('envSet', {
        templateUrl: '/_view/application/env_set',
        controller: 'EnvironmentSetCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'env_set', des: '多环境管理页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/EnvironmentSet',
      })
      .state('flow', {
        templateUrl: '/_view/application/flow',
        controller: 'APIFlowCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'flow', des: '流量控制页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/ApiFlowList',
      })
      .state('caution', {
        templateUrl: '/_view/application/caution',
        controller: 'APICautionCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'caution', des: '报警设置页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/ApiCautionList',
      })
      .state('category', {
        templateUrl: '/_view/application/category',
        controller: 'CategoryCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'category', des: '分类管理页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/CategoryList',
      })
      .state('group', {
        templateUrl: '/_view/application/group',
        controller: 'CategoryGroupCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'group', des: '子分类管理页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/ConCategoryGroupList',
      })
      .state('noapply', {
        templateUrl: '/_view/application/noapply',
        controller: 'NoApplyCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'noapply', des: '免审核管理页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/NoApplyList',
      })
      .state('auth', {
        templateUrl: '/_view/application/auth',
        controller: 'AuthorityCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'authority', des: '应用白名单页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/SsvIsvUserList',
      })
      .state('mail', {
        templateUrl: '/_view/application/mail',
        controller: 'MailCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'mail', des: '邮箱管理页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/UserMailList',
      })
      .state('notify', {
        templateUrl: '/_view/application/notify',
        controller: 'NotifyCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'notify', des: '提醒管理页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/NotifyManage',
      })
      .state('ping', {
        templateUrl: '/_view/application/ping',
        controller: 'PingCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'ping', des: 'API地址扫描列表'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/ApiPingList',
      })
      .state('assistSandbox', {
        templateUrl: '/_view/application/assist_sandbox',
        controller: 'SandboxLogAssistCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'assist_sandbox', des: '日志分析(沙箱)页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/statistics/AppApiAssistSsvSandbox',
      })
      .state('assist', {
        templateUrl: '/_view/application/assist',
        controller: 'LogAssistCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'assist', des: '日志分析(正式)页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/statistics/AppApiAssistSsv',
      })
      .state('analysisSandbox', {
        templateUrl: '/_view/application/analysis_sandbox',
        controller: 'SandboxLogAnalysisCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'analysis_sandbox', des: '日志查看(沙箱)页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/statistics/LogAnalyzeSandbox',
      })
      .state('analysis', {
        templateUrl: '/_view/application/analysis',
        controller: 'LogAnalysisCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'analysis', des: '日志查看(正式)页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/statistics/LogAnalyze',
      })
      .state('download', {
        templateUrl: '/_view/application/download',
        controller: 'DownloadCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'download_list', des: '说明文档下载页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/DownloadList',
      })
      .state('doc', {
        templateUrl: '/_view/application/doc',
        controller: 'DocCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'doc', des: '文档管理页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/SsvDocList',
      })
      .state('notice', {
        templateUrl: '/_view/application/notice',
        controller: 'NoticeCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'notice', des: '公告管理页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/SsvNoticeList',
      })
      .state('tool', {
        templateUrl: '/_view/application/tool',
        controller: 'ToolDownloadCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'tool', des: '开发工具下载页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/ToolDownload',
      })
      .state('sdk', {
        templateUrl: '/_view/application/sdk',
        controller: 'SDKCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'sdk', des: 'SDK下载页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/SdkDownload',
      })
      .state('func', {
        templateUrl: '/_view/application/func',
        controller: 'FunctionCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'func', des: '详细信息维护页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/Function',
      })
      .state('subuser', {
        templateUrl: '/_view/application/subuser',
        controller: 'SubUserCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'subuser', des: '子帐号列表页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/SubUserList',
      })
      .state('dataroleset', {
        templateUrl: '/_view/application/dataroleset',
        controller: 'DataRoleSetCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'dataroleset', des: '数据白名单页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/DataRoleSet',
      })
      .state('productlist', {
        templateUrl: '/_view/application/productlist',
        controller: 'ProductListCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'productlist', des: '产品列表页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/ProductList',
      })
      .state('productuserlist', {
        templateUrl: '/_view/application/productuserlist',
        controller: 'ProductUserListCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'productuserlist', des: '用户产品列表页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/ProductUserList',
      })
      .state('productchargelist', {
        templateUrl: '/_view/application/productchargelist',
        controller: 'ProductChargeListCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'productchargelist', des: '产品购买记录页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
        url: '/ssv/ProductChargeList',
      })
      .state('messages', {
        templateUrl: '/_view/common/msg',
        controller: 'MessageCtrl',
        url: '/ssv/messages',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'messages', des: '待办消息页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
      })
      .state('frame', {
        params: {
          src: ''
        },
        templateUrl: '/_view/application/frame',
        controller: 'FrameCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'frame', des: '嵌套型老页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
      })
      .state('error', {
        params: {
          error: ''
        },
        templateUrl: '/_view/application/error',
        controller: 'ErrorCtrl',
        onEnter: ['$rootScope', ($rootScope) => {$rootScope.tab = {key: 'error', des: '错误提示页面'}}],
        resolve: {_preLoading: ['$rootScope', ($rootScope) => $rootScope.preloadingPromise]},
      })
    //$urlRouterProvider.otherwise('/ssv/apilist')
    $locationProvider.html5Mode(true)
    $locationProvider.hashPrefix('!')

    $httpProvider.interceptors.push('HttpObserver')
  }])

app.run(['$rootScope', '$state', '$location', '$window', '$http', '$cookies', '$mdDialog', '$mdUtil', '$mdMedia', '$q', '$timeout', 'ScopeInitializer', 'LogProcessor', ($rootScope, $state, $location, $window, $http, $cookies, $mdDialog, $mdUtil, $mdMedia, $q, $timeout, ScopeInitializer, LogProcessor) => {
  $rootScope.nav_menu = {}

  ScopeInitializer.contextSelector = 'body>section>md-content'
  angular.extend($rootScope, ScopeInitializer)
  $rootScope.logout = () => {return ScopeInitializer.logout(() => {ScopeInitializer.toPlatform('sso?from=application')})}
  $rootScope.minify = () => {return !$mdMedia('(min-width: 1400px)')}
  $rootScope.mini = $rootScope.minify()
  $rootScope.toggleMini = () => {$rootScope.mini = !$rootScope.mini}
  $rootScope.isAdmin = () => {return $rootScope.profile && (($rootScope.profile.login_user_type == '0') || ($rootScope.profile.login_user_type == '3'))}
  $rootScope.isSsv = () => {return $rootScope.profile && ($rootScope.profile.login_user_type == '2')}
  $rootScope.isIsv = () => {return $rootScope.profile && ($rootScope.profile.login_user_type == '1')}
  $rootScope.showLog = LogProcessor.showLog
  $rootScope.isMobile = window.isMobile
  $rootScope.isProd = () => window.Constant.host.indexOf('rongcapital') != -1  

  let loadingQ
  $rootScope.validateEntry = (reload) => {
    var defer = $q.defer()
    //!loadingQ && (loadingQ = $rootScope.removeLoading());
    if (!$rootScope.checkSession()) {
      $rootScope.logout()
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
    return defer.promise.then((isOld) => {
      if (isOld) {
        $rootScope.go('frame', {src: `/frame/${$location.path()}`})
        return $q.reject()
      }
    }, why => {$rootScope.alert(why)})
  }
  $rootScope.validateBtnRole = (type) => {
    var result = false
    if ($rootScope.nav_menu && $rootScope.nav_menu.subEntry && $rootScope.nav_menu.subEntry.sub_func_role && $rootScope.nav_menu.subEntry.sub_func_role.length && type && ([].concat.apply([], $rootScope.nav_menu.subEntry.sub_func_role.map(r => [r.role_name])).indexOf(type) != -1)) {
      result = true
    }
    return result
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
        //console.log($location)
        $location.hash('')
        $location.path(url)
      } else if (reload && $state.current.name) {
        $rootScope.globalBack = null
        $state.transitionTo($state.current, {}, {reload: true})
      } else {
        //$rootScope.reload()
      }
    }
  }
  $rootScope.isSubEntryActive = (func, index) => {return $rootScope.nav_menu && ($rootScope.nav_menu._subEntry == (($rootScope.nav_menu.func_list && $rootScope.nav_menu.func_list.length ? $rootScope.nav_menu.func_list.indexOf(func) : 0) + String(index)))}
  let refreshHints = (body) => {
    $rootScope.systemHints = []
    if (body.hints && body.hints.length) {
      for (var i = 0; i < body.hints.length; i++) {
        if (body.hints[i].pages && body.hints[i].pages.length) {
          $rootScope.systemHints = [].concat.apply($rootScope.systemHints, body.hints[i].pages.map(r => {
            r.msg_url = body.hints[i].url
            return r
          }))
        }
      }
    }
    $rootScope.rawSystemHints = body.hints
  }
  $rootScope.getSystemHints = () => {
    /*var source = new EventSource('/sse/common/tips')
     source.onmessage = (e) => {
     if (window._lastHttpRequest && ((window._lastHttpRequest.getTime() + Constant.exipration) < new Date().getTime())) {
     //$rootScope.locate('sso?from=application');
     $rootScope.quitSession('application')
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
     refreshHints(body)
     } else {
     source.close()
     }
     $rootScope.$apply()
     }
     /!*source.onerror = e=>{console.log(e);console.log(new Date())}
     source.onopen = e=>{console.log(e);console.log(new Date())}*!/
     window.addEventListener('beforeunload', (event) => {
     source.close()
     })*/

    var socket = io(`${Constant.protocol}://${Constant.host}:${Constant.port}`, {transports: ['polling']})// TIP: io() with no args does auto-discovery
    /*socket.on('connect', function (msg) { // TIP: you can avoid listening on `connect` and listen on events directly too!
     console.log(msg)
     });*/
    socket.on('message', (message) => {
      let _session = $cookies.get('_session') ? JSON.parse($cookies.get('_session')) : '', quiter = () => {
        window.location.href = `${Constant.protocol}://${Constant.host}:${Constant.port}/sso?from=application`
      }

      if (!_session || (document.querySelector('meta[name=session]').content != _session.id)) {
        return quiter()
      }
      if (message.login_user_name && (message.login_user_name == _session.login_user_name)) {
        var body = message.body
        if (((typeof body.is_success == 'boolean') && body.is_success) || ((typeof body.is_success == 'string') && (body.is_success == 'true'))) {
          refreshHints(body)
          $rootScope.$digest()
        }
      } else {
        return quiter()
      }
    })
  }
  $rootScope.refreshSystemHints = () => $http.post('/agent', {
    module: 'common',
    partial: 'common',
    api: 'tips'
  }).then(body => {
    if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
      refreshHints(body.data)
    } else {
      $rootScope.warn(body.data.msg)
    }
  }, $rootScope.alert)

  $rootScope.toggleHintPanel = (e) => {
    $rootScope._showHint = !$rootScope._showHint
  }
  $rootScope.closeHintPanel = () => {
    $rootScope._showHint = false
  }
  $rootScope.checkSession = () => {
    let _session = $cookies.get('_session') ? JSON.parse($cookies.get('_session')) : '';
    (_session && !$rootScope.profile && (document.querySelector('meta[name=session]').content == _session.id)) && ($rootScope.profile = _session)
    if (!_session || !$rootScope.profile) {
      $rootScope.profile = undefined
      $cookies.remove('_session', {path: '/', domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`})
      window.rxStream && window.rxStream.userIdentify()
      return false
    }

    return true
  }
  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    $mdDialog.hide()
    /*if(!$rootScope.checkSession()){
     // 如果在此做session过期校验，可能会导致url反复变化的现象，故取消此处session校验，改用其他地方比如拦截器校验，或者推送校验等
     //$rootScope.toPlatform('sso?from=application');
     event.preventDefault();
     return false;
     }*/
    /*else if (($rootScope.profile.login_user_status == "0") && (toState != "error")){
     $rootScope.go('error',{error:"用户尚未审核，无法访问页面"});
     event.preventDefault();
     return false;
     }*/
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
  if (!$rootScope.checkSession()) {
    $rootScope.logout()
    return
  } else {
    if ($rootScope.isAdmin()) {
      $rootScope.toPlatform('console')
      return
    } else if ($rootScope.isIsv()) {
      $rootScope.toPlatform('dashboard')
      return
    }
  }

  let navQ = $http.post('/agent', {module: 'application', partial: 'common', api: 'nav_menu'})

  $q.all([navQ, $rootScope.preloadingPromise]).then((result) => {
    var body = result[0]
    if ((((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) && (body.data.func_list && body.data.func_list.length)) {
      angular.extend($rootScope.nav_menu, body.data)
      var subFuncList = [].concat.apply(['/ssv/messages'], $rootScope.nav_menu.func_list.map(r => r.sub_func_list && r.sub_func_list.length ? [].concat.apply([], r.sub_func_list.map(x => [x.sub_class_name.toLowerCase().replace(/^([^\/])/, '/$1')])) : []))
      if (($location.path() == '') || ($location.path() == '/')) {
        if ($rootScope.nav_menu && $rootScope.nav_menu.func_list && $rootScope.nav_menu.func_list.length) {
          var validFuncList = [].concat.apply([], $rootScope.nav_menu.func_list.map(r => r.sub_func_list && r.sub_func_list.length ? [r] : []))[0]
          if (validFuncList && validFuncList.sub_func_list && validFuncList.sub_func_list[0] && validFuncList.sub_func_list[0].sub_class_name) {
            $location.path(validFuncList.sub_func_list[0].sub_class_name)
          } else {
            $rootScope.go('error', {error: '您暂时没有访问权限，请联系管理员，E011'})
          }
        } else {
          $rootScope.go('error', {error: '您暂时没有访问权限，请联系管理员，E011'})
        }
      } else if (subFuncList.indexOf($location.path().toLowerCase()) == -1) {
        $rootScope.go('error', {error: '您暂时没有访问权限，请联系管理员，E011'})
      }
      return body.data
    } else {
      // TODO 左边栏如果不能成功刷出，所有后台应用则无意义
      //$rootScope.logout()
      ScopeInitializer.logout(() => {ScopeInitializer.toPlatform('sso?from=application&message=您的账号无菜单权限，请联系管理员')})
      return $q.reject()
    }
  }, why => {
    $rootScope.alert(why)
    $rootScope.logout()
    return $q.reject()
  }).then(() => {
    $rootScope.getSystemHints()
  })

  let $body = angular.element('body')
  $body.on('keyup', e => {
    if ((e.currentTarget === e.target) && (e.target === $body[0]) && (e.keyCode == 8)) {
      $rootScope.globalBack && $rootScope.globalBack.call()
      $rootScope.$digest()
    }
  })
  window.addEventListener('message', e => {
    if (e.data == 'expired') {
      $rootScope.logout()
    }
  })
}])

angular.bootstrap(document, ['application'])
/*require(['./application/app'], () => {
 angular.bootstrap(document, ['application'])
 })*/
