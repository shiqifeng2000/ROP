/**
 * Created by robin on 22/11/2016.
 */

'use strict'

let controllerModule = angular.module('welcome.controllers', [])
controllerModule
  .config(['$provide','$logProvider','$compileProvider', ($provide, $logProvider, $compileProvider) => {
    $logProvider.debugEnabled(false);
    $compileProvider.debugInfoEnabled(false)
  }]).controller('IndexCtrl', ['$rootScope', '$scope', '$http', '$q', '$window',
    ($rootScope, $scope, $http, $q, $window) => {
      $('a[href^="#"]', '#partials').click(e => {
        e.preventDefault()
      })

      let swiperOpt = {
        pagination: '.swiper-pagination',
        autoplay: 4000,
        speed: 400,
        slidesPerView: 1,
        paginationClickable: true,
        spaceBetween: 30,
        keyboardControl: true,
        effect: 'fade',
        preloadImages: false,
        onLazyImageReady(swiper, slide, image) {},
        onProgress(swiper, progress) {}
      }
      document.body.scrollTop = 0

      $('.transitionEndBubbleStop').off('transitionend')
      $('.transitionEndBubbleStop').bind('transitionend', e => {
        e.stopPropagation()
      })
      //window.swiper = $('.swiper-container:visible').length ? new Swiper('.swiper-container', swiperOpt) : undefined
      //!window.swiper && (window.swiper = new Swiper('.swiper-container', swiperOpt))

      window.test = $scope
      $scope.$on('$viewContentLoaded', ()=>{
        $rootScope.removeLoading().finally(()=>{
          !window.swiper && (window.swiper = new Swiper('.swiper-container', swiperOpt))
        })
      })
    }])
  .controller('SuppliersCtrl', ['$rootScope', '$scope', '$http', ($rootScope, $scope, $http) => {
    $scope.items = []
    $scope.ssvs = []
    $scope.pageindex = 1

    //$scope.cols = 3;//( $rootScope.orientation == 'landscape') ? 3 : 5
    $('a[href^="#"]', '#partials').click(e => {
      e.preventDefault()
    })
    $scope.load = () => {
      if (!$scope.lock) {
        $scope.lock = true
        $http.post('/agent', {
          module: 'welcome',
          partial: 'suppliers',
          api: 'suppliers',
          /*param: {pageindex: $scope.pageindex++}*/
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            let elementSelector = []
            $scope.items = body.data.data_list
          } else {
            $rootScope.alert(body.data.msg)
          }
          $scope.lock = false
        }, why => {
          // TODO 弹窗
          $rootScope.alert(why)
          $scope.lock = false
        })
      }
    }
    $scope.toSsv = ssv => {
      $scope.locate(`${Constant.protocol}://${ssv.user_domain}.${Constant.host}:${Constant.port}`)
    }

    $scope.isOdd = index => {
      let isOdd = index % 2
      return isOdd
    }
    $scope.load()
    $scope.$on('$viewContentLoaded', $rootScope.removeLoading)
  }])
  .controller('DocCtrl', ['$rootScope', '$scope', '$http', '$stateParams', '$location', '$q', '$mdSidenav',
    ($rootScope, $scope, $http, $stateParams, $location, $q, $mdSidenav) => {
      let docId = $stateParams.docId ? $stateParams.docId : $location.search().doc

      let catQ = $q.when(),
        getCatQ = () => {
          $scope.loading = true
          return $rootScope.ajax('doc_cat', {}).then(body => {$scope.rootTree = body.cat_list_level_1}).finally(() => {$scope.loading = false})
        },
        getDetailQ = doc_id => {
          if ($scope.refreshing) {return $q.reject()}
          $scope.refreshing = true
          $scope.legacyDocument = null
          return $rootScope.ajax('doc_detail', {doc_id}).then(data => {
            let flag = true
            catQ.then(() => {
              $scope.rootTree.every((trunk, i) => {
                delete trunk._detail
                if (flag) {
                  trunk.cat_list_level_2 && trunk.cat_list_level_2.length && trunk.cat_list_level_2.every((branch, i) => {
                    delete branch._isOpen
                    if ((branch ? branch.doc_id.toLowerCase() : '') == (doc_id ? doc_id.toLowerCase() : '')) {
                      branch._isOpen = true
                      $scope.currentTrunk = trunk
                      branch._detail = data
                      flag = false
                    }
                    return true
                  })
                  return true
                }
                return false
              })

              // TODO 假如在现有分类里面未出现，我们认为这就是一个老文档
              if (flag) {
                $scope.legacyDocument = data
              }
            })
            return data
          }).finally(() => {
            $scope.refreshing = false
          })
        }

      $scope.toggleDetail = (trunk, branch) => {
        $scope.currentTrunk = []
        $scope.checkoutDoc(trunk, branch)
      }
      /*$scope.locateAnchor = (index) => {
       angular.element('.view-frame').animate({
       scrollTop: angular.element('.content-list')[index].offsetTop
       })
       }*/
      $scope.checkoutDoc = (trunk, branch) => {
        if ($scope.refreshing) {return $q.reject()}
        if ($scope.loading) {return $q.reject()}
        let trueBranch = branch
        if (!trueBranch) {
          trueBranch = trunk.cat_list_level_2[0]
        }

        if (trueBranch.doc_id) {
          //$scope.docId = trueBranch.doc_id;
          if ($scope.docId && trueBranch.doc_id && ($scope.docId.toLowerCase() == trueBranch.doc_id.toLowerCase())) {
            $mdSidenav('doc_detail').open()
          } else {
            $rootScope.go('document.details', {id: trueBranch.doc_id ? trueBranch.doc_id.toLowerCase() : ''})
          }
        }
      }
      $scope.getDetailQ = getDetailQ
      $scope.getCatQ = getCatQ
      $scope.closeDetail = () => $mdSidenav('doc_detail').close()
      $scope.reset = () => {
        $scope.docId = ''
        $scope.detail = null
        catQ.then(() => {
          $scope.rootTree.every((trunk, i) => {
            delete trunk._detail
            trunk.cat_list_level_2 && trunk.cat_list_level_2.length && trunk.cat_list_level_2.every((branch, i) => {
              delete branch._isOpen
            })
          })
        })
      }
      !$scope.rootTree && (catQ = $scope.getCatQ())
      $scope.catQ = catQ

      window.test = $scope
      $scope.$on('$viewContentLoaded', $rootScope.removeLoading)
    }])
  .controller('DocDetailCtrl', ['$rootScope', '$scope', '$stateParams', '$timeout', '$state', '$q', '$mdSidenav', ($rootScope, $scope, $stateParams, $timeout, $state, $q, $mdSidenav) => {
    let docId = $stateParams.id, detailQ = $scope.$parent.catQ.then(() => $scope.getDetailQ(docId)).then(data => {
      $scope.$parent.detail = data
      window.rxStream && window.rxStream.track('rop_document_visit', {
        properties: {
          'b_rop_document_name': data.doc_name || '未知页面'
        }
      })
    }), sidePanel = $mdSidenav('doc_detail')

    // 用于计算rem
    var tempElement = document.createElement('i')
    tempElement.style.width = '1rem'
    tempElement.style.display = 'block'
    document.body.appendChild(tempElement)
    let rem = angular.element(tempElement).width()
    document.body.removeChild(tempElement)

    $scope.imageresizer = (element) => {
      angular.element("img", element).each((i, img) => {
        let $img = angular.element(img), naturalWidth = $img.attr('width'), naturalHeight = $img.attr('height')

        if (naturalWidth && naturalHeight) {
          $img.css({height: ($rootScope.screenRect.width - 9.87 * rem - 2) * naturalHeight / naturalWidth})
        }
      })
    }
    $scope.$parent.docId = docId

    detailQ.then(() => {
      $rootScope.nextTick(() => {
        $mdSidenav('doc_detail').toggle()
      })
    })
    $scope.$on('$destroy', function () {
      if ($state.current.name != 'document.details') {
        if($mdSidenav('doc_detail').isOpen()){
          $mdSidenav('doc_detail').close()
        }
        $scope.reset()
      }
    })
    $scope.$on('$viewContentLoaded', $rootScope.removeLoading)
  }])
  .controller('LoginCtrl', ['$rootScope', '$scope', '$http', '$cookies', '$stateParams',($rootScope, $scope, $http, $cookies, $stateParams) => {
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
  .controller('SDKToolCtrl', ['$rootScope', '$scope', '$http', '$stateParams',
    ($rootScope, $scope, $http, $stateParams) => {
      $scope.sdks = [
        {logo: '/resource/logo-dotnet.png', bg: '#33B5E5'},
        {logo: '/resource/logo-java.png', bg: '#AA66CC'},
        {logo: '/resource/logo-php.png', bg: '#00CC99'},
        {logo: '/resource/logo-js.png', bg: '#FFBB33'},
        {logo: '/resource/logo-android.png', bg: '#FF4444'}]
      $('a[href^="#"]', '#partials').click(e => {
        e.preventDefault()
      })

      let sdkQ = $http.post('/agent', {
        module: 'welcome',
        partial: 'sdktool',
        api: 'list',
        param: {sdk_type: 1}
      }).then(body => {
        if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
          $scope.sdkcontent = []
          for (let prop in body.data.sdk) {
            $scope.sdkcontent.push($.extend({_title: prop}, body.data.sdk[prop]))
          }
        } else {
          $rootScope.alert(body.data.msg)
        }
      }, why => {
        // TODO 弹窗
        $rootScope.alert(why)
      })

      $scope.$on('$viewContentLoaded', $rootScope.removeLoading)
    }])
  .controller('FeaturesCtrl', ['$rootScope', '$scope', '$http', '$state',
    ($rootScope, $scope, $http, $state) => {
      $('a[href^="#"]', '#partials').click(e => {
        e.preventDefault()
      })

      $scope.$on('$viewContentLoaded', $rootScope.removeLoading)
    }])
  .controller('APICtrl', ['$rootScope', '$scope', '$http', '$state',
    ($rootScope, $scope, $http, $state) => {
      /*$('a[href^="#"]', '#partials').click(e => {
       e.preventDefault();
       });*/

      let catQ = () => $http.post('/agent', {module: 'welcome', partial: 'api', api: 'list'}).then(body => {
        $scope.originalCat = {cat_list: body.data.cat_list, _selectedItem: 0}
        if (body.data && body.data.cat_list && body.data.cat_list.length) {
          $scope.cat = {cat_list: body.data.cat_list, _selectedItem: 0}
          if ($scope.cat.cat_list) {
            for (let j = 0; j < $scope.cat.cat_list.length; j++) {
              if ($scope.cat.cat_list[j].group_list) {
                $scope.cat.cat_list[j]._selectedItem = 0
                /*if($scope.apiCategoryId == $scope.cat.cat_list[j].cat_id){
                 $scope.cat._selectedItem = j;
                 }*/
                for (let i = 0; i < $scope.cat.cat_list[j].group_list.length; i++) {
                  //$scope.cat.cat_list[j].group_list[i].dynamicAPIItems = new DynamicItems($scope.cat.cat_list[j].group_list[i].api_list);
                  if ($scope.cat.cat_list[j].group_list[i].api_list) {
                    for (let k = 0; k < $scope.cat.cat_list[j].group_list[i].api_list.length; k++) {
                      /*if(mode && mode.apiMethod && (mode.apiMethod == $scope.cat.cat_list[j].group_list[i].api_list[k].api_id)){
                       $scope.cat.cat_list[j]._selectedItem = i;
                       }*/
                    }
                  }
                }
              }
            }
          }
        } else {
          $scope.cat = {cat_list: body.data.cat_list, _selectedItem: 0}
          $rootScope.alert('当前供应商没有任何API发布')
        }
      }, why => {
        $rootScope.alert(why)
      })
      $scope.changeAPISearch = () => {
        //$scope.cat = JSON.parse(JSON.stringify($scope.originalCat));
        var cat = JSON.parse(JSON.stringify($scope.originalCat))
        cat._selectedItem = $scope.cat._selectedItem
        if (cat.cat_list) {
          for (let j = 0; j < cat.cat_list.length; j++) {
            cat.cat_list[j]._selectedItem = $scope.cat.cat_list[j]._selectedItem
            if (cat.cat_list[j].group_list) {
              for (let i = 0; i < cat.cat_list[j].group_list.length; i++) {
                if (cat.cat_list[j].group_list[i].api_list) {
                  var k = cat.cat_list[j].group_list[i].api_list.length
                  while (k--) {
                    ((cat.cat_list[j].group_list[i].api_list[k].api_name.indexOf($scope.apiSearch) == -1) && (cat.cat_list[j].group_list[i].api_list[k].api_title.indexOf($scope.apiSearch) == -1)) && (cat.cat_list[j].group_list[i].api_list.splice(k, 1))
                  }
                }
              }
            }
          }
        }
        $scope.cat = cat

      }
      catQ()
      $scope.apiMethod = (api) => {
        return `${Constant.protocol}://${Constant.host}/api/ApiMethod-${api.api_id}.html`
      }
      $scope.$on('$viewContentLoaded', $rootScope.removeLoading)
    }])
  .controller('DebugToolCtrl', ['$rootScope', '$scope', '$http', '$stateParams', '$location',
    ($rootScope, $scope, $http, $stateParams, $location) => {
      let key = $stateParams.key ? $stateParams.key : $location.search().key
      $('#mainFrame').attr('src', `/frame/ApiTool/index${key ? ('?sign=' + key) : ''}`)
      $('a[href^="#"]', '#partials').click(e => {
        e.preventDefault()
      })

      $scope.$on('$viewContentLoaded',
        event => {
          window._messageListener = event => {
            if (event.origin == Constant.legacyDomain) {
              console.log(event.data)
              $('iframe').height(event.data + 20)
            }
          }
          window.addEventListener('message', window._messageListener)

          $rootScope._toolbarFeature = 2
          $rootScope.removeLoading()
        })
    }])
  .controller('ServicesCtrl', ['$rootScope', '$scope', '$http', '$mdDialog', '$mdSidenav', '$window',
    ($rootScope, $scope, $http, $mdDialog, $mdSidenav, $window) => {
      $('a[href^="#"]', '#partials').click(e => {
        e.preventDefault()
      })

      let q1 = $http.post('/agent', {
        module: 'welcome',
        partial: 'services',
        api: 'notice',
        param: {}
      }).then(body => {
        if (body.data.data_list && body.data.data_list.length) {
          $scope.notice_list = body.data.data_list
        }
      }, why => {
        //$scope.details = why.data
        // TODO 弹窗
        $rootScope.alert(why)
      })

      let q2 = $http.post('/agent', {
        module: 'welcome',
        partial: 'services',
        api: 'faq',
        param: {}
      }).then(body => {
        if (body.data.data_list && body.data.data_list.length) {
          $scope.faqs = body.data.data_list
        }
      }, why => {
        //$scope.details = why.data
        // TODO 弹窗
        $rootScope.alert(why)
      })

      $scope.toggleSidenav = () => $mdSidenav('right').toggle()
      $scope.askQuestion = e => {
        if ($scope.qaForm.$invalid) {
          $mdDialog.show(
            $mdDialog.alert()
              .title('提示')
              .textContent('请核对提交表单是否正确')
              .ariaLabel('提交失败')
              .ok('好的')
              .targetEvent(e)
          )
          $scope.qaForm.$error.required && $scope.qaForm.$error.required.forEach(r => {
            r.$setDirty(true)
          })
          return
        }
        e.preventDefault()
        return $http.post('/agent', {
          module: 'welcome',
          partial: 'services',
          api: 'askQuestion',
          param: $scope.question
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            //$scope.notice_list = body.data.data_list;
            $mdDialog.show(
              $mdDialog.alert()
                .title('提交成功')
                .textContent('我们收到了您的问题，会尽快回答，请次日登录帮助中心查看我们的回复.')
                .ariaLabel('提交成功')
                .ok('好的')
                .targetEvent(e)
            )
            $mdSidenav('right').close()
          } else {
            $mdDialog.show(
              $mdDialog.alert()
                .title('提交失败')
                .textContent(body.data.msg)
                .ariaLabel('提交失败')
                .ok('好的')
                .targetEvent(e)
            )
          }
        }, why => {
          //$scope.details = why.data
          // TODO 弹窗
          $rootScope.alert(why)
        })
      }

      $scope.$on('$viewContentLoaded', $rootScope.removeLoading)
    }])
  .controller('SearchCtrl', ['$rootScope', '$scope', '$http',
    ($rootScope, $scope, $http) => {
      $scope.searchCategory = 'all'
      $scope.hints = []
      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
      let initial = true
      $scope.searcher = (index, size) => {
        if (initial) {
          initial = false
          return
        }
        $http.post('/agent', {
          module: 'welcome',
          partial: 'search',
          api: 'search',
          param: {
            pageindex: index || $scope.pageIndex,
            pagesize: size || $scope.pageSize,
            searchflg: $scope.searchCategory,
            keyword: $('#bloodhound').val()
          }
        }).then(body => {
          $scope.response = body.data.response
          if (body.data.response && body.data.response.docs && body.data.response.docs.length) {
            if ($scope.searchCategory == 'all') {
              $scope.total = body.data.response.numFound
            } else if ($scope.searchCategory == 'api') {
              $scope.total = body.data.response.numFoundApi
            } else if ($scope.searchCategory == 'doc') {
              $scope.total = body.data.response.numFoundDoc
            } else if ($scope.searchCategory == 'sdk') {
              $scope.total = body.data.response.numFoundSdk
            } else if ($scope.searchCategory == 'tool') {
              $scope.total = body.data.response.numFoundTool
            } else if ($scope.searchCategory == 'other') {
              $scope.total = body.data.response.numFoundOther
            } else {
              $scope.total = 0
            }
          } else {
            $scope.total = 0
          }
          setTimeout(() => {
            $(window).trigger('scroll')
          }, 100)
        }, why => {
          // TODO 弹窗
          $rootScope.alert(why)
          $scope.total = 0
        })
      }

      $http.post('/agent', {module: 'welcome', partial: 'search', api: 'hints'}).then(body => {
        if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
          $scope.rawHints = body.data.hint_list
          require(['bloodhound', 'typeahead'], () => {
            let keyword = new Bloodhound({
              datumTokenizer (str) {
                return str ? str.split('') : []
              },
              queryTokenizer (str) {
                return str ? str.split('') : []
              },
              sorter: function (itemA, itemB) {
                if (itemA.indexOf($scope.keyword) > itemB.indexOf($scope.keyword)) {
                  return -1
                } else if (itemA.indexOf($scope.keyword) < itemB.indexOf($scope.keyword)) {
                  return 1
                } else {
                  return 0
                }
              },
              // `states` is an array of state names defined in "The Basics"
              local: $scope.rawHints.map(r => r.title)
            })
            $('.typeahead').typeahead({
                hint: true,
                highlight: true,
                minLength: 1
              },
              {
                name: 'keyword',
                source: keyword,
                limit: 10
              }).on('typeahead:selected', (event, selection) => {
              $scope.research($scope.searchCategory)
              $scope.$digest()
            })
          })
        } else {
          $rootScope.alert(body.data.msg)
        }
      }, why => {
        // TODO 弹窗
        $rootScope.alert(why)
      })

      $scope.research = (cat, key) => {
        //(typeof key != 'undefined') && ($scope.keyword = key);
        $scope.hints = []
        $scope.searchCategory = cat
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.$on('$viewContentLoaded',
        event => {
          $rootScope.removeLoading()
        })
    }])
