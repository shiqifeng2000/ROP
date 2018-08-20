/**
 * Created by robin on 22/11/2016.
 */

'use strict'

let controllerModule = angular.module('welcome.controllers', [])
controllerModule
  .config(['$provide', '$logProvider', '$compileProvider', ($provide, $logProvider, $compileProvider) => {
    $logProvider.debugEnabled(false)
    $compileProvider.debugInfoEnabled(false)
  }]).controller('IndexCtrl', ['$rootScope', '$scope', '$http', '$timeout', '$window',
  ($rootScope, $scope, $http, $timeout, $window) => {
    // 防止屏幕抖动
    $('a[href^="#"]', '#partials').click(e => {e.preventDefault()})
    $scope.news = []

    $scope.showMeTitle = e => {
      let flag = $(e.currentTarget).hasClass('animation')
      $(e.currentTarget).toggleClass('animation')
    }

    let getDevelopers = () => $http.post('/agent', {
      module: 'welcome',
      partial: 'index',
      api: 'suppliers',
    }).then(body => {
      if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
        $scope.devs = body.data.data_list
      } else {
        $rootScope.alert(body.data.msg)
      }
    }, why => {
      // TODO 弹窗
      $rootScope.alert(why)
    })

    let swiperOpt = {
      pagination: '.swiper-pagination',
      autoplay: 6000,
      speed: 800,
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

    /*setTimeout(() => {
     $rootScope.removeLoading();
     });*/
    $('.transitionEndBubbleStop').off('transitionend')
    $('.transitionEndBubbleStop').bind('transitionend', e => {e.stopPropagation()})
    $rootScope._toolbarFeature = 0
    window.test = $scope
    $scope.$on('$viewContentLoaded', event => {
      $rootScope.removeLoading().finally(() => {
        $scope.nextTick(() => {
          (window.swiper = new Swiper('.swiper-container', swiperOpt))
        })
        //window.swiper = $('.swiper-container').length ? new Swiper('.swiper-container', swiperOpt) : undefined
      })
    })
  }])
  .controller('SuppliersCtrl', ['$rootScope', '$scope', '$http', ($rootScope, $scope, $http) => {
    $scope.items = []
    $scope.ssvs = []
    $scope.pageindex = 1
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
      let isOdd = (index % 6 + Math.floor(index / 6)) % 2
      return isOdd
    }
    $scope.load()
    $scope.$on('$viewContentLoaded', $rootScope.removeLoading)
  }])
  .controller('DocCtrl', ['$rootScope', '$scope', '$http', '$stateParams', '$location', '$q', '$state',
    ($rootScope, $scope, $http, $stateParams, $location, $q, $state) => {
      let visitCounter = param => $rootScope.ajax('view_count', param), catQ = $q.when(),
        getCatQ = () => {
          $scope.loading = true
          return $rootScope.ajax('doc_cat', {}).then(body => {$scope.rootTree = body.cat_list_level_1}).finally(() => {$scope.loading = false})
        },
        getDetailQ = doc_id => {
          if ($scope.refreshing) {return $q.reject()}
          $scope.refreshing = true
          $scope.legacyDocument = null
          //$scope.detail = {}
          return $rootScope.ajax('doc_detail', {doc_id}).then(data => {
            let flag = true
            catQ.then(() => {
              $scope.rootTree.every((trunk, i) => {
                delete trunk._detail
                if (flag) {
                  trunk.cat_list_level_2 && trunk.cat_list_level_2.length && trunk.cat_list_level_2.every((branch, i) => {
                    delete branch._isOpen;
                    (trunk !== $scope.currentTrunk) && (delete branch._detail)
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

            visitCounter({doc_id, set_type: 0})
            $scope.detail = data
            return data
          }).finally(() => {
            $scope.refreshing = false
          })
        }

      $scope.locateAnchor = (index) => {
        angular.element('.view-frame').animate({
          scrollTop: angular.element('.content-list')[index].offsetTop
        })
      }
      $scope.checkoutDoc = (trunk, branch) => {
        if ($scope.refreshing) {return $q.reject()}
        if ($scope.loading) {return $q.reject()}
        let trueBranch = branch
        if (!trueBranch) {
          trueBranch = trunk.cat_list_level_2[0]
        }

        if (trueBranch.doc_id) {
          //$scope.docId = trueBranch.doc_id;
          $scope.detailQ = $scope.getDetailQ(trueBranch.doc_id).then(data => {
            $scope.detail = data
            window.rxStream && window.rxStream.track('rop_document_visit', {
              properties: {
                'b_rop_document_name': data.doc_name || '未知页面'
              }
            })
            $rootScope.go('document.details', {id: trueBranch.doc_id && trueBranch.doc_id.toLowerCase() || ''})
          })
        }
      }
      $scope.getDetailQ = getDetailQ
      $scope.getCatQ = getCatQ
      $scope.anchorIndex = 0
      $scope.reset = () => {
        $scope.docId = ''
        $scope.detail = null
        catQ.then(() => {
          $scope.rootTree.every((trunk, i) => {
            delete trunk._detail
            trunk.cat_list_level_2 && trunk.cat_list_level_2.length && trunk.cat_list_level_2.every((branch, i) => {
              delete branch._isOpen
              delete branch._detail
            })
          })
        })
      }
      !$scope.rootTree && (catQ = $scope.getCatQ());
      ($state.current.name == 'document.details') && ($scope.detailQ = getDetailQ($state.params.id))
      window.test = $scope
      $scope.$on('$viewContentLoaded',
        event => {
          $rootScope.removeLoading()
          var highlightIndex = 0, lastScrollTop
          angular.element('.view-frame').on('scroll', (e) => {
            var list = angular.element('.content-list', e.currentTarget), viewHeight = (window.innerHeight - 177)
            for (var i = list.length - 1; i >= 0; i--) {
              var scrollTop = e.currentTarget.scrollTop, elem = list[i]
              if ((elem.offsetTop >= scrollTop) && (elem.offsetTop <= (scrollTop + viewHeight))) {
                if (lastScrollTop <= scrollTop) {
                  if ((i == list.length - 1) || ((i != list.length - 1) && (highlightIndex != (list.length - 1)))) {
                    highlightIndex = i
                  }
                } else {
                  highlightIndex = i
                }
              }
            }
            if ($scope.anchorIndex != highlightIndex) {
              if ((e.currentTarget.scrollHeight - e.currentTarget.scrollTop) == window.innerHeight) {
                $scope.anchorIndex = (list.length - 1)
              } else {
                $scope.anchorIndex = highlightIndex
              }
              $scope.$apply()
            }
            lastScrollTop = e.currentTarget.scrollTop
          })
        })
    }])
  .controller('DocDetailCtrl', ['$rootScope', '$scope', '$stateParams', '$timeout', '$state', '$q', ($rootScope, $scope, $stateParams, $timeout, $state, $q) => {
    let docId = $stateParams.id, detailQ = $scope.detailQ
    if($scope.detail && $scope.detail.doc_id && (docId.toLowerCase() != $scope.detail.doc_id.toLowerCase())){
      $scope.$parent.detail = {}
      detailQ = $scope.getDetailQ(docId)
    }
    $scope.imageresizer = (element) => {
      //let containerWidth = element.width(), containerHeight = element.height()
      angular.element('img', element).each((i, img) => {
        let $img = angular.element(img), naturalWidth = $img.attr('width'), naturalHeight = $img.attr('height')
        if (naturalWidth && naturalHeight && (naturalWidth >= 862)) {
          $img.css({height: 862 * naturalHeight / naturalWidth})
        }
      })
    }
    $scope.$parent.docId = docId
    $scope.docUrl = `${Constant.protocol}://${Constant.host}/welcome/document/${docId}`
    require(['clipboard'], (Clipboard, inView) => {
      let _lang = $rootScope._lang, beforeClipboardCopy = (_lang == 'zh-cn') ? '复制文档地址' : 'Copy document URL',
        afterClipboardCopy = (_lang == 'zh-cn') ? '已复制' : 'Copied',
        workaroundSupportClipboard = action => {
          let actionMsg = ` 来${action === 'cut' ? '剪切' : '拷贝'}`
          let actionKey = (action === 'cut' ? 'X' : 'C')

          if (/iPhone|iPad/i.test(navigator.userAgent)) {
            actionMsg = '暂不支持iPhone和iPad :('
          }
          else if (/Mac/i.test(navigator.userAgent)) {
            actionMsg = `请按 ⌘-${actionKey}${actionMsg}`
          }
          else {
            actionMsg = `请按 Ctrl-${actionKey}${actionMsg}`
          }
          return actionMsg
        }, cliper = new Clipboard('.cliper')
      $scope.clipboardHints = beforeClipboardCopy
      $scope.locator = (e, hash) => {
        e.preventDefault()
        e.stopPropagation()
        let currentScrollTop = $('.view-frame.doc .sub-frame')[0].scrollTop
        $('.view-frame.doc .sub-frame').animate({
          scrollTop: currentScrollTop + $(hash).offset().top - 64
        })
      }
      detailQ.then(() => {
        cliper.on('success', e => {
          e.clearSelection()
          $scope.clipboardHints = afterClipboardCopy
          //$scope.tooltipFlag = true;
          $scope.$apply()
          $timeout(() => {
            //$scope.tooltipFlag = false;
            $scope.clipboardHints = beforeClipboardCopy
          }, 5000)
        })

        cliper.on('error', e => {
          $scope.clipboardHints = workaroundSupportClipboard(e.action)
          $scope.$apply()
          $timeout(() => {
            $scope.clipboardHints = beforeClipboardCopy
          }, 5000)
        })
      })
      window.test1 = $scope
      $scope.$on('$destroy', function () {
        cliper && cliper.destroy()
        if ($state.current.name != 'document.details') {$scope.reset()}
      })
    })
    $scope.$on('$viewContentLoaded', event => {
      document.querySelector('.view-frame').scrollTop = 0
      $rootScope.removeLoading()
    })
  }])
  .controller('FeaturesCtrl', ['$rootScope', '$scope', '$http', '$state',
    ($rootScope, $scope, $http, $state) => {
      $('a[href^="#"]', '#partials').click(e => {
        e.preventDefault()
      })

      $scope.$on('$viewContentLoaded', $rootScope.removeLoading)
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
        var keyword = $('#bloodhound').val()
        window.rxStream && window.rxStream.track('search_key', {
          properties: {
            'b_key': keyword,
            'b_category': $scope.searchCategory
          }
        })
        $http.post('/agent', {
          module: 'welcome',
          partial: 'search',
          api: 'search',
          param: {
            pageindex: index || $scope.pageIndex,
            pagesize: size || $scope.pageSize,
            searchflg: $scope.searchCategory,
            keyword: keyword
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
          $rootScope.warn(body.data.msg)
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
          $rootScope.removeLoading()
        })
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
          $scope.sdk = body.data.sdk
          /*for (let prop in body.data.sdk) {
           $scope.sdkcontent.push($.extend({_title: prop}, body.data.sdk[prop]))
           }*/
        } else {
          $rootScope.warn(body.data.msg)
        }
      }, why => {
        // TODO 弹窗
        $rootScope.alert(why)
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
