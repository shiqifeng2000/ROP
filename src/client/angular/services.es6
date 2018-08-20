/*define([ 'snap', 'common', 'angularLoad'], ( Snap) => {
 'use strict'

 })*/

angular.module('rop.services', ['ngMaterial', 'ngMessages', 'ngCookies', 'ui.router', 'oc.lazyLoad'])
  .config(['$ocLazyLoadProvider', ($ocLazyLoadProvider) => {
    $ocLazyLoadProvider.config({
      jsLoader: requirejs,
      debug: false
    })
  }])
  /*.config(($stateProvider) => {
   $stateProvider.decorator('parent', (internalStateObj, parentFn) =>{
   // This fn is called by StateBuilder each time a state is registered
   // The first arg is the internal state. Capture it and add an accessor to public state object.
   internalStateObj.self.$$state = () => { return internalStateObj; };
   // pass through to default .parent() function
   return parentFn(internalStateObj);
   })
   })*/
  .factory('ScopeInitializer', ['$rootScope', '$q', '$mdMedia', '$cookies', '$window', '$state', '$http', '$mdDialog', '$mdUtil', '$timeout', '$mdToast', '$location', ($rootScope, $q, $mdMedia, $cookies, $window, $state, $http, $mdDialog, $mdUtil, $timeout, $mdToast, $location) => {
    let obj = {},
      _lang = $cookies.get('_lang'),
      alertDialog = (msg) => {
        return $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(obj.contextSelector ? document.querySelector(obj.contextSelector) : document.body))
            .clickOutsideToClose(true)
            .textContent(msg)
            .ariaLabel(msg)
            .ok((_lang == 'zh-cn') ? '了解' : 'Got it')
        )
      },
      toastDialog = (msg, type) => {
        !obj.previousToast && (obj.previousToast = [])
        let ExportController = (scope, $mdToast) => {
          scope.msg = msg
          scope.type = type
          scope.close = () => $mdToast.hide()
        }, processor = (defer) => {
          var toastPromise = $mdToast.show({
            controller: ExportController,
            template: `
                                    <md-toast ng-class="{'success':type}">
                                        <div class="md-toast-content">
                                            <div class="wrapper">
                                                <span ng-bind="msg"></span>
                                            </div>
                                            <md-icon md-svg-icon="content:ic_clear_24px" ng-click="close()"></md-icon>
                                        </div>
                                    </md-toast>
                                `,
            parent: angular.element(obj.contextSelector ? document.querySelector(obj.contextSelector) : document.body),
            //hideDelay: 4000,
            autoWrap: false,
            position: 'top left'
          }).then(() => {
            defer.resolve()
            obj.previousToast.splice(obj.previousToast.indexOf(defer.promise), 1)
          })
          return toastPromise
        }
        if (obj.previousToast.length) {
          var previousToast = obj.previousToast[obj.previousToast.length - 1], defer = $q.defer()
          obj.previousToast.push(defer.promise)
          // $mdToast.hide()
          return previousToast.then(() => {
            processor(defer)
          })
        } else {
          var newdefer = $q.defer()
          obj.previousToast.push(newdefer.promise)
          processor(newdefer)
        }
      },
      confirmDialog = (msg, accept, reject) => {
        let confirm = $mdDialog.confirm()
          .parent(angular.element(obj.contextSelector ? document.querySelector(obj.contextSelector) : document.body))
          .textContent(msg)
          .ariaLabel('确认框')
          .clickOutsideToClose(true)
          .ok((_lang == 'zh-cn') ? '确定' : 'Yes')
          .cancel((_lang == 'zh-cn') ? '取消' : 'No')
        return $mdDialog.show(confirm).then(() => {
          if (accept && (typeof accept == 'function')) {
            return accept.call()
          }
        }, () => {
          if (reject && (typeof reject == 'function')) {
            return reject.call()
          }
        })
      },
      toPlatform = path => {
        $window.location.href = `${Constant.protocol}://${Constant.host}:${Constant.port}/${path ? path.replace(/^\/*(.*?)\/*$/, '$1') : ''}`
      },
      getSystemHints = () => {
        $http.post('/agent', {
          module: 'common',
          partial: 'common',
          api: 'tips'
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            $rootScope.systemHints = []
            if (body.data.hints && body.data.hints.length) {
              for (var i = 0; i < body.data.hints.length; i++) {
                if (body.data.hints[i].pages && body.data.hints[i].pages.length) {
                  $rootScope.systemHints = [].concat.apply($rootScope.systemHints, body.data.hints[i].pages.map(r => {
                    r.msg_url = body.data.hints[i].url
                    return r
                  }))
                }
              }
            }
          } else {
            obj.warn(body.data.msg)
          }
        }, why => {
          obj.alert(why)
        })
      },
      LoginController = ($scope, $mdDialog) => {
        $scope.login_msg = ''
        /*$scope.loginMistakes = $cookies.get("_showCaptcha")?3:0;
         let captcha_img = "/captcha?l=50&_l=1", rememberMistakes = ()=>{
         $scope.loginMistakes++;
         if($scope.loginMistakes > 2){
         let today = new Date();
         $cookies.put("_showCaptcha", true, {path: "/", domain: `${Constant.nosubdomain?'':'.'}${Constant.host}`,expires: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)})
         }
         }, forgetMistakes = ()=>{
         $cookies.put("_showCaptcha", "", {path: "/", domain: `${Constant.nosubdomain?'':'.'}${Constant.host}`});
         $cookies.remove("_showCaptcha",{path: "/", domain: `${Constant.nosubdomain?'':'.'}${Constant.host}`});
         };*/
        //$scope.captcha_img = `${captcha_img}&time=${new Date().getTime()}`;
        $scope.clearMsg = () => {
          $scope.login_msg = ''
        }
        let reactive = myParam => {
          $http.post('/agent', {
            module: 'common',
            partial: 'login',
            api: 'reactive',
            param: myParam
          }).then(body => {
            var data = body.data || {}
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              //$scope.login_msg = ''
              $scope.login_msg = ($rootScope._lang == 'zh-cn') ? '账号激活邮件已发送' : 'Account actived'
              $scope.reactive = null
            } else {
              $scope.login_msg = data.msg
            }
          }, why => {
            $scope.login_msg = why
          })
        }
        $scope.login = obj.throttle(() => {
          $scope.reactive = null
          if ($scope.refreshing) {return}
          if ($scope.loginForm.$invalid) {
            $scope.loginForm.$error.required && $scope.loginForm.$error.required.forEach(r => {
              r.$setDirty(true)
            })
            $('#loginPanel').addClass('invalid')
            $timeout(() => {
              $('#loginPanel').removeClass('invalid')
              $scope.login_msg = ($rootScope._lang == 'zh-cn') ? '请检查输入项是否正确' : 'Please verify the inputs'
            }, 600)
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
              getSystemHints.call()
              $mdDialog.hide()
              $('.login').css('pointerEvents', '')
            } else {
              //rememberMistakes.call();
              $('.login>.md-dialog-container>md-dialog').addClass('invalid')
              $timeout(() => {
                $('.login>.md-dialog-container>md-dialog').removeClass('invalid')
                $scope.login_msg = body.data.msg
              }, 600)

              if (body.data.code == 'Y4') {
                $scope.reactive = $rootScope.throttle(() => reactive(myParam), 800)
              }
            }
          }, why => {
            $scope.login_msg = why
          }).finally(() => {
            $scope.refreshing = false
          })
        }, 800)

        $scope.resetCaptcha = () => {
          $scope.captchaCode = ''
          $scope.captcha_img = `${captcha_img}&time=${new Date().getTime()}`
        }
        $scope.clearMsg = () => {
          $scope.login_msg = ''
        }
        $scope.verifyCode = () => {
          let _captcha = $cookies.get('_captcha')
          if (_captcha) {
            return $scope.captchaCode && ($scope.captchaCode.toLowerCase() == $cookies.get('_captcha').toLowerCase())
          } else {
            $scope.resetCaptcha()
            return
          }
        }
        $scope.close = () => {
          $mdDialog.hide()
          $('.login').css('pointerEvents', '')
        }
        $scope.toPlatform = $rootScope.toPlatform
      },
      // 以100为单位，画100次
      loadingTriangles = [
        [{x: 5.26166667, y: 26.99955}, {x: 9.46644444, y: 34.20105}, {x: 13.6788148, y: 26.99955}],
        [{x: 10.5233333, y: 34.7985}, {x: 18.9344074, y: 34.7985}, {x: 14.7281111, y: 27.597}],
        [{x: 15.7795333, y: 26.99955}, {x: 19.9903852, y: 34.20105}, {x: 24.195163, y: 26.99955}],
        [{x: 21.0384667, y: 34.7985}, {x: 29.4556148, y: 34.7985}, {x: 25.2523556, y: 27.597}],
        [{x: 26.3001333, y: 26.99955}, {x: 30.5064296, y: 34.20105}, {x: 34.7172815, y: 26.99955}],
        [{x: 31.5618, y: 18.00045}, {x: 35.7680963, y: 25.20195}, {x: 39.9789481, y: 18.00045}],
        [{x: 31.5618, y: 16.79895}, {x: 39.9789481, y: 16.79895}, {x: 35.7680963, y: 9.59745}],
        [{x: 30.507037, y: 16.2015}, {x: 34.7178889, y: 9}, {x: 26.3007407, y: 9}],
        [{x: 34.7178889, y: 7.7985}, {x: 30.507037, y: 0.597}, {x: 26.3007407, y: 7.7985}],
        [{x: 21.0384667, y: -0.00045}, {x: 25.2523556, y: 7.20105}, {x: 29.4556148, y: -0.00045}],
        [{x: 10.5233333, y: -0.00045}, {x: 14.7281111, y: 7.20105}, {x: 18.9344074, y: -0.00045}],
        [{x: 9.46644444, y: 0.597}, {x: 5.26166667, y: 7.7985}, {x: 13.6788148, y: 7.7985}],
        [{x: 13.6788148, y: 9}, {x: 5.26166667, y: 9}, {x: 9.46644444, y: 16.2015}],
        [{x: 0, y: 16.79895}, {x: 8.41714815, y: 16.79895}, {x: 4.2062963, y: 9.59745}],
        [{x: 0, y: 18.00045}, {x: 4.2062963, y: 25.20195}, {x: 8.41714815, y: 18.00045}],
        [{x: 19.9897778, y: 7.2015}, {x: 11.0107778, y: 22.5675}, {x: 28.9687778, y: 22.5675}]
      ], circleList = document.querySelectorAll('.loading svg.triangle circle'),
      pathList = document.querySelectorAll('.loading svg.triangle path'), preloadingDefer = $q.defer(),
      loadingDefer = $q.defer()
    Snap.animate(0, 300, function (val) {
      for (var i = 0; i < pathList.length; i++) {
        var r = pathList[i]
        if (val <= 100) {
          angular.element(r).attr({
            d: `M${loadingTriangles[i][0].x},${loadingTriangles[i][0].y} L${loadingTriangles[i][0].x + (loadingTriangles[i][1].x - loadingTriangles[i][0].x) * (Math.min(val, 100)) / 100},${loadingTriangles[i][0].y + (loadingTriangles[i][1].y - loadingTriangles[i][0].y) * (Math.min(val, 100) / 100)}`
          })
        } else if (val <= 200) {
          angular.element(r).attr({
            d: `M${loadingTriangles[i][0].x},${loadingTriangles[i][0].y} L${loadingTriangles[i][1].x},${loadingTriangles[i][1].y} L${loadingTriangles[i][1].x + (loadingTriangles[i][2].x - loadingTriangles[i][1].x) * (val - 100) / 100},${loadingTriangles[i][1].y + (loadingTriangles[i][2].y - loadingTriangles[i][1].y) * ((val - 100) / 100)}`
          })
        } else if (val < 300) {
          angular.element(r).attr({
            d: `M${loadingTriangles[i][0].x},${loadingTriangles[i][0].y} L${loadingTriangles[i][1].x},${loadingTriangles[i][1].y} L${loadingTriangles[i][2].x},${loadingTriangles[i][2].y} L${loadingTriangles[i][2].x + (loadingTriangles[i][0].x - loadingTriangles[i][2].x) * (val - 200) / 100},${loadingTriangles[i][2].y + (loadingTriangles[i][0].y - loadingTriangles[i][2].y) * ((val - 200) / 100)}`
          })
        } else if (val == 300) {
          angular.element(r).attr({
            d: `M${loadingTriangles[i][0].x},${loadingTriangles[i][0].y} L${loadingTriangles[i][1].x},${loadingTriangles[i][1].y} L${loadingTriangles[i][2].x},${loadingTriangles[i][2].y} L${loadingTriangles[i][0].x},${loadingTriangles[i][0].y}Z`
          })
        }
      }
    }, ROPStyleConstant.preLoadingTime, () => {
      preloadingDefer.resolve()
    })
    /*angular.element($window).bind('unload', () => {
      document.querySelector('.loading').style.display = ''
      //$('.loading').removeClass("out")
      $('.loading').fadeIn()
    })*/
    return angular.extend(obj, {
      removeLoading () {
        if (!angular.element('.loading').hasClass('out')) {
          $('.loading').addClass('start')
          preloadingDefer.promise.then(() => {
            Snap.animate(0, 100, function (val) {
              for (var i = 0; i < pathList.length; i++) {
                var r = pathList[i]
                if (i + 1 < pathList.length) {
                  angular.element(r).css({fill: `rgba(0,197,163,${val / 100})`})
                } else {
                  angular.element(r).css({fill: `rgba(255,255,255,${val / 100})`})
                }
              }
            }, ROPStyleConstant.loadingTime, () => {
              loadingDefer.resolve()
              $('.loading').fadeOut(300, () => {$('.loading').addClass('out').detach()})
              /*$('.loading').addClass("out").one($.support.transition.end, () => {
               document.querySelector('.loading').style.display = "none";
               })*/
            })
          })
          return loadingDefer.promise
        } else {
          return $q.when()
        }
      },
      preloadingPromise: preloadingDefer.promise,
      loadingPromise: loadingDefer.promise,
      minify () {
        return !$mdMedia('(min-width: 1400px)')
      },
      _lang: _lang,
      locate (url) {
        $window.location.href = url
      },
      openPopup (path) {
        $window.open(`${Constant.protocol}://${Constant.host}:${Constant.port}/${path || ''}`, '_blank')
      },
      toPlatform: toPlatform,
      goStateViaURL: (path, param, option) => {
        var allStates = $state.get()
        for (var i = 0; i < allStates.length; i++) {
          var url = allStates[i].url,
            myPath = path ? path.replace(/^([^\/])/, '/$1') : ''
          if (url.toLowerCase() == myPath.toLowerCase()) {
            obj.go(allStates[i].name, param)
            break
          }
        }
        /*var myparam = ""
         if (param && (typeof param == "object")) {
         for (var prop in param) {
         myparam += `${prop}=${param[prop]}`
         }
         }
         $location.url(`${[path]}${myparam ? '?' + myparam : ''}`)*/
      },
      go (tab, params, option) {
        $state.go(tab, params, option)
      },
      reload () {
        $state.reload()
      },
      logout (success, fail) {
        let self = this
        return $http.post('/logout').then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            //$rootScope.profile = undefined;
            if (success && (typeof success == 'function')) {
              window.rxStream && window.rxStream.userIdentify()
              $cookies.put('_session', null, {path: '/', domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`})
              $cookies.remove('_session', {path: '/', domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`})
              let result = success.call()
              if (result && result.then && (typeof result.then == 'function')) {
                return result.then()
              } else {
                return $q.when()
              }
            }
          } else {
            if (fail && (typeof fail == 'function')) {
              let result = fail.call(body.msg)
              if (result && result.then && (typeof result.then == 'function')) {
                return result.then()
              } else {
                return $q.reject()
              }
            }
          }
          //toHome.call();
          return $q.reject()
        }, why => {
          self.alert(why)
          return $q.reject()
        })
      },
      quitSession (from) {
        let self = this
        return $http.post('/quit').then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            $cookies.put('_session', null, {path: '/', domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`})
            $cookies.remove('_session', {path: '/', domain: `${Constant.nosubdomain ? '' : '.'}${Constant.host}`})
            window.rxStream && window.rxStream.userIdentify()
            toPlatform(`sso${from ? ('?from=' + from) : ''}`)
          } else {
            self.warn(body.msg)
          }
        }, why => {self.alert(why)})
      },
      alert: alertDialog,
      warn: toastDialog,
      confirm: confirmDialog,
      ajax (api, _param, _cb, _fail) {
        if (!api) {
          return
        }
        let callback, param = _param, fail, self = this, tab = $rootScope.tab && $rootScope.tab.key || 'common'
        if (typeof _cb == 'function') {
          callback = _cb
          fail = _fail
        } else if (typeof _param == 'function') {
          callback = _param
          fail = _cb
        }
        !self._module && (self._module = document.querySelector('meta[name=module]').content)
        return $http.post('/agent', {
          module: self._module,
          partial: tab,
          api: api,
          param: param
        }).then(body => {
          if (!$rootScope.tab || !$rootScope.tab.key || (tab != $rootScope.tab.key)) {
            return $q.reject('请不要频繁切换模块')
          }
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            if (callback && (typeof callback == 'function')) {
              let q = callback.call(null, body.data)
              if (q) {
                return q
              }
            }
            return body.data
          } else {
            self.warn(body.data.msg)
            return $q.reject(body.data.msg)
          }
        }, why => {
          self.alert(why);
          (fail && (typeof fail == 'function')) && fail.call()
          return $q.reject(why)
        })
      },
      ajaxQ (api, _param, _cb, _fail) {
        if (!api) {
          return
        }
        let callback, param = _param, fail, self = this, tab = $rootScope.tab && $rootScope.tab.key || 'common'
        if (typeof _cb == 'function') {
          callback = _cb
          fail = _fail
        } else if (typeof _param == 'function') {
          callback = _param
          fail = _cb
        }
        !self._module && (self._module = document.querySelector('meta[name=module]').content)
        return $http.post('/agent', {
          module: self._module,
          partial: tab,
          api: api,
          param: param
        }).then(body => {
          if (!$rootScope.tab || !$rootScope.tab.key || (tab != $rootScope.tab.key)) {
            return $q.reject('请不要频繁切换模块')
          }
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            if (callback && (typeof callback == 'function')) {
              let q = callback.call(null, body.data)
              if (q) {
                return q
              }
            }
            return body.data
          } else {
            self.warn(body.data.msg)
            return $q.reject(body.data.msg)
          }
        }, why => {
          self.alert(why);
          (fail && (typeof fail == 'function')) && fail.call()
          return $q.reject(why)
        })
      },
      /*ajax (tab, api, _param, _cb, _fail) {
       if (!api || !tab) {
       return
       }
       let callback, param = _param, fail, self = this, tab = $rootScope.tab
       if (typeof _cb == 'function') {
       callback = _cb
       fail = _fail
       } else if (typeof _param == 'function') {
       callback = _param
       fail = _cb
       }
       !self._module && (self._module = document.querySelector('meta[name=module]').content)
       return $http.post('/agent', {
       module: self._module,
       partial: tab,
       api: api,
       param: param
       }).then(body => {
       if (tab != $rootScope.tab) {
       $q.reject('请不要频繁切换模块')
       }
       if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
       if (callback && (typeof callback == 'function')) {
       let q = callback.call(null, body.data)
       if (q) {
       return q
       }
       }
       return body.data
       } else {
       self.alert(body.data.msg)
       return $q.reject(body.data.msg)
       }
       }, why => {
       self.alert(why);
       (fail && (typeof fail == 'function')) && fail.call()
       return $q.reject(why)
       })
       },*/
      browserType: window.getBrowserType(),
      OSName: window.getOSName(),
      nextTick () {
        $mdUtil.nextTick.apply(null, arguments)
      },
      throttle: $mdUtil.throttle,
      debounce: $mdUtil.debounce,
      defer () {
        return $q.defer()
      },
      apiRedirect (api) {
        return `${Constant.legacyDomain}/api/redirect?api_name=${api}`
      },
      showLogin (ev) {
        $('.login').css('pointerEvents', 'auto')
        return $mdDialog.show({
          controller: LoginController,
          templateUrl: '/_view/common/login',
          parent: angular.element('.login'),
          clickOutsideToClose: false,
          targetEvent: ev,
          openFrom: ev.target,
        }).then(answer => {}, () => {$('.login').css('pointerEvents', '')})
      },
      snap: Snap,
      getSystemHints: getSystemHints,
      screenRect: document.body.getBoundingClientRect(),
      browserBack () {
        window.history.back()
      },
      isElement(obj) {
        try {
          //Using W3 DOM2 (works for FF, Opera and Chrom)
          return obj instanceof HTMLElement
        }
        catch (e) {
          //Browsers not supporting W3 DOM2 don't have HTMLElement and
          //an exception is thrown and we end up here. Testing some
          //properties that all elements have. (works on IE7)
          return (typeof obj === 'object') &&
            (obj.nodeType === 1) && (typeof obj.style === 'object') &&
            (typeof obj.ownerDocument === 'object')
        }
      }
    })
  }])
  .factory('ROPDateUtil', function () {
    let getFirstDateOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1)
      },
      getMonthsInSeason = (date) => {
        var months = [], monthIndex = date.getMonth()
        if ((monthIndex >= 0) && (monthIndex <= 2)) {
          months = [0, 1, 2]
        } else if ((monthIndex >= 3) && (monthIndex <= 5)) {
          months = [3, 4, 5]
        } else if ((monthIndex >= 6) && (monthIndex <= 8)) {
          months = [6, 7, 8]
        } else if ((monthIndex >= 9) && (monthIndex <= 11)) {
          months = [9, 10, 11]
        }
        return months
      },
      getNumberOfDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      },
      getDateInNextMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 1)
      },
      getDateInPreviousMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() - 1, 1)
      },
      isSameMonthAndYear = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
      },
      isSameDay = (d1, d2) => {
        return d1.getDate() == d2.getDate() && isSameMonthAndYear(d1, d2)
      },
      isInNextMonth = (startDate, endDate) => {
        var nextMonth = getDateInNextMonth(startDate)
        return isSameMonthAndYear(nextMonth, endDate)
      },
      isInPreviousMonth = (startDate, endDate) => {
        var previousMonth = getDateInPreviousMonth(startDate)
        return isSameMonthAndYear(endDate, previousMonth)
      },
      getDateMidpoint = (d1, d2) => {
        return createDateAtMidnight((d1.getTime() + d2.getTime()) / 2)
      },
      getWeekOfMonth = (date) => {
        var firstDayOfMonth = getFirstDateOfMonth(date)
        return Math.floor((firstDayOfMonth.getDay() + date.getDate() - 1) / 7)
      },
      incrementDays = (date, numberOfDays) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + numberOfDays)
      },
      incrementMonths = (date, numberOfMonths) => {
        var dateInTargetMonth = new Date(date.getFullYear(), date.getMonth() + numberOfMonths, 1)
        var numberOfDaysInMonth = getNumberOfDaysInMonth(dateInTargetMonth)
        if (numberOfDaysInMonth < date.getDate()) {
          dateInTargetMonth.setDate(numberOfDaysInMonth)
        } else {
          dateInTargetMonth.setDate(date.getDate())
        }

        return dateInTargetMonth
      },
      getMonthDistance = (start, end) => {
        return (12 * (end.getFullYear() - start.getFullYear())) + (end.getMonth() - start.getMonth())
      },
      getLastDateOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), getNumberOfDaysInMonth(date))
      },
      isValidDate = (date) => {
        return date != null && date.getTime && !isNaN(date.getTime())
      },
      setDateTimeToMidnight = (date) => {
        if (isValidDate(date)) {
          date.setHours(0, 0, 0, 0)
        }
      },
      createDateAtMidnight = (opt_value) => {
        var date
        if (angular.isUndefined(opt_value)) {
          date = new Date()
        } else {
          date = new Date(opt_value)
        }
        setDateTimeToMidnight(date)
        return date
      },
      isDateWithinRange = (date, minDate, maxDate) => {
        var dateAtMidnight = createDateAtMidnight(date)
        var minDateAtMidnight = isValidDate(minDate) ? createDateAtMidnight(minDate) : null
        var maxDateAtMidnight = isValidDate(maxDate) ? createDateAtMidnight(maxDate) : null
        return (!minDateAtMidnight || minDateAtMidnight <= dateAtMidnight) &&
          (!maxDateAtMidnight || maxDateAtMidnight >= dateAtMidnight)
      },
      isMinTimeBeforeMaxTime = (minTime, maxTime, token) => {
        if (!token || (typeof token != 'string')) {
          return null
        }

        var minTimeArray = minTime.split(token).map(r => {
          return Number.parseInt(r)
        }), maxTimeArray = maxTime.split(token).map(r => {
          return Number.parseInt(r)
        })
        if ((minTimeArray.length < 3) || (maxTimeArray.length < 3)) {
          return null
        }

        var minTimestamp = minTimeArray[2] + minTimeArray[1] * 60 + minTimeArray[0] * 60 * 60,
          maxTimestamp = maxTimeArray[2] + maxTimeArray[1] * 60 + maxTimeArray[0] * 60 * 60
        return (minTimestamp <= maxTimestamp)
      },
      isTimeWithinRange = (time, minTime, maxTime, token) => {
        if (!token || (typeof token != 'string')) {
          return null
        }

        var timeArray = time.split(token).map(r => {
          return Number.parseInt(r)
        }), minTimeArray = minTime.split(token).map(r => {
          return Number.parseInt(r)
        }), maxTimeArray = maxTime.split(token).map(r => {
          return Number.parseInt(r)
        })
        if ((minTimeArray.length < 3) || (maxTimeArray.length < 3) || (timeArray.length < 3)) {
          return null
        }

        var timestamp = timeArray[2] + timeArray[1] * 60 + timeArray[0] * 60 * 60,
          minTimestamp = minTimeArray[2] + minTimeArray[1] * 60 + minTimeArray[0] * 60 * 60,
          maxTimestamp = maxTimeArray[2] + maxTimeArray[1] * 60 + maxTimeArray[0] * 60 * 60
        return (timestamp <= maxTimestamp) && (minTimestamp <= timestamp)
      },
      isValidTime = (time, token) => {
        return new RegExp('^([0-1]?[0-9]|2[0-3])' + token + '([0-5]?[0-9])' + token + '([0-5]?[0-9])$').test(time)
      },
      freeFormatDate = (date, fmt) => { //author: meizz
        let o = {
          'M+': date.getMonth() + 1, //月份
          'd+': date.getDate(), //日
          'H+': date.getHours(), //小时
          'm+': date.getMinutes(), //分
          's+': date.getSeconds(), //秒
          'q+': Math.floor((date.getMonth() + 3) / 3), //季度
          'S': date.getMilliseconds() //毫秒
        }
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, String(date.getFullYear()).substr(4 - RegExp.$1.length))
        for (let k in o) {
          if (new RegExp(`(${k})`).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)))
        }
        return fmt
      }

    return {
      getFirstDateOfMonth: getFirstDateOfMonth,
      getNumberOfDaysInMonth: getNumberOfDaysInMonth,
      getDateInNextMonth: getDateInNextMonth,
      getDateInPreviousMonth: getDateInPreviousMonth,
      isInNextMonth: isInNextMonth,
      isInPreviousMonth: isInPreviousMonth,
      getDateMidpoint: getDateMidpoint,
      isSameMonthAndYear: isSameMonthAndYear,
      getWeekOfMonth: getWeekOfMonth,
      incrementDays: incrementDays,
      incrementMonths: incrementMonths,
      getLastDateOfMonth: getLastDateOfMonth,
      isSameDay: isSameDay,
      getMonthDistance: getMonthDistance,
      isValidDate: isValidDate,
      setDateTimeToMidnight: setDateTimeToMidnight,
      createDateAtMidnight: createDateAtMidnight,
      isDateWithinRange: isDateWithinRange,
      isMinTimeBeforeMaxTime: isMinTimeBeforeMaxTime,
      isValidTime: isValidTime,
      isTimeWithinRange: isTimeWithinRange,
      getMonthsInSeason: getMonthsInSeason,
      freeFormatDate: freeFormatDate
    }
  })
  /**
   * Module Loader
   * 用于动态加载那些比较大的组件，插件，集成了requirejs，默认会把被require文件的所有module加载进来
   * 如果有的组件dom在module加载前已被编译过，则需要指定selector重新编译
   * 传入scope，用于指定组件所在的环境
   * file: String 或者 Array
   * selector: String
   * scope: obj
   * thanks to ocLazyLoad
   * */
  .factory('ModuleLoader', ['$q', '$ocLazyLoad', '$compile', '$interpolate', 'ScopeInitializer', ($q, $ocLazyLoad, $compile, $interpolate, ScopeInitializer) => {
    return {
      _loader: $ocLazyLoad,
      reload (file, selector, scope) {
        var defer = $q.defer()
        $ocLazyLoad.load(file).then(() => {
          var elem
          if (selector && (typeof selector == 'string') || ScopeInitializer.isElement(selector)) {
            elem = angular.element(selector)
          } else if (selector && selector.context) {
            elem = selector
          }

          if (elem) {
            if (scope) {
              $compile(elem)(scope)
            } else {
              $compile(elem)({})
            }
          }
          defer.resolve()
        }, () => {
          ScopeInitializer.alert('组件初始化失败')
          defer.reject()
        })
        return defer.promise
      },
      require (files){
        var defer = $q.defer()
        require(files, (...param) => {defer.resolve(param)}, (...err) => {defer.reject(err)})
        return defer.promise
      }
    }
  }])
