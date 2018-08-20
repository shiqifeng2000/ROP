/**
 * Created by robin on 22/11/2016.
 */
/*define(['require', 'clipboard', 'treeview', 'packagetree', 'string2json', '../services'], function (require, Clipboard) {
 'use strict'


 })*/

let controllerModule = angular.module('supplier.controllers', [])
controllerModule
  .config(['$provide', '$logProvider', '$compileProvider', ($provide, $logProvider, $compileProvider) => {
    $logProvider.debugEnabled(false)
    $compileProvider.debugInfoEnabled(false)
  }]).controller('IndexCtrl', ['$scope', '$injector', ($scope, $injector) => {
  require(['supplier/controllers/index'], (IndexController) => {
    $injector.invoke(IndexController, this, {'$scope': $scope})
    $scope.$digest()
  })
}])
  .controller('DocumentCtrl', ['$rootScope', '$scope', '$http', '$filter', '$q', '$cookies', '$stateParams', '$mdSidenav', '$mdDialog', '$timeout', '$state',
    ($rootScope,
     $scope,
     $http,
     $filter,
     $q,
     $cookies,
     $stateParams,
     $mdSidenav,
     $mdDialog,
     $timeout, $state) => {
      //let mode = $rootScope._param, modeCatId = $rootScope._cat_id;
      $scope.defaultDetails = {api_name: 'API名字'}
      $scope.nav = {
        entry: 'api',
        subEntry: '',
        subDomains: []
      }, $scope.breadcrumbs = [], $scope.selectedEntry = 0, $scope.cat = {
        cat_list: [],
        _selectedItem: 0
      }, $scope.makeDebugUrl = api => `${Constant.protocol}://${Constant.host}/ApiTool/index?sign=${api}`
      $scope.makeSDKUrl = api => `${Constant.protocol}://${Constant.host}/welcome/sdkTool`, $scope.simpleAPILevelDescription = () => {
        //$("#simpleAPILevelDescription").modal();
      }
      class DynamicItems {
        constructor (list) {
          this.list = list
          this.PAGE_SIZE = 10
          this.loadedPages = {}
          for (let i = 0; i < Math.ceil(this.list.length / this.PAGE_SIZE); i++) {
            this.loadedPages[i] = []
            this.loadedPages[i] = this.list.slice(i * this.PAGE_SIZE, (i + 1) * this.PAGE_SIZE)
          }
        }

        getItemAtIndex (index) {
          let pageNumber = Math.floor(index / this.PAGE_SIZE)
          let page = this.loadedPages[pageNumber]
          if (page) {
            return page[index % this.PAGE_SIZE]
          } else {
            return []
          }
        }

        getLength () {
          return this.list.length
        }
      }

      let getCatQ = () => {
        if ($scope.loading) {return}

        $scope.loading = true
        return $http.post('/agent', {
          module: 'supplier',
          partial: 'document',
          api: 'get_ssv_cat',
          param: {ssv_user_id: $rootScope.ssv_user_id}
        }).then(body => {
          $scope.originalCat = {cat_list: body.data.cat_list, _selectedItem: 0}
          if (body.data && body.data.cat_list && body.data.cat_list.length) {
            $scope.cat = {cat_list: body.data.cat_list, _selectedItem: 0}
            if ($scope.cat.cat_list) {
              for (let j = 0; j < $scope.cat.cat_list.length; j++) {
                if ($state.current.name == 'document.domain') {
                  if ($scope.cat.cat_list[j].domain_list) {
                    //$scope.cat.cat_list[j]._selectedDomainItem = 0;
                    if ($scope.apiCategoryId == $scope.cat.cat_list[j].cat_id) {
                      $scope.cat._selectedItem = j
                    }
                    for (let i = 0; i < $scope.cat.cat_list[j].domain_list.length; i++) {
                      if (($rootScope.ssv_info.id ? $rootScope.ssv_info.id.toLowerCase() : '') == ($scope.cat.cat_list[j].domain_list[i].domain_id ? $scope.cat.cat_list[j].domain_list[i].domain_id.toLowerCase() : '')) {
                        //$scope.cat.cat_list[j]._selectedDomainItem = i;
                        if (!$scope.apiCategoryId) {
                          $scope.apiCategoryId = $scope.cat.cat_list[j].cat_id
                          $scope.cat._selectedItem = j
                        }
                        if (!$scope.apiCategoryName) {
                          $scope.apiCategoryName = $scope.cat.cat_list[j].cat_name
                        }
                      }
                    }
                  }
                }

                if ($scope.cat.cat_list[j].group_list) {
                  $scope.cat.cat_list[j]._selectedItem = 0
                  if ($scope.apiCategoryId == $scope.cat.cat_list[j].cat_id) {
                    $scope.cat._selectedItem = j
                  }
                  for (let i = 0; i < $scope.cat.cat_list[j].group_list.length; i++) {
                    //$scope.cat.cat_list[j].group_list[i].dynamicAPIItems = new DynamicItems($scope.cat.cat_list[j].group_list[i].api_list);
                    if ($scope.cat.cat_list[j].group_list[i].api_list) {
                      for (let k = 0; k < $scope.cat.cat_list[j].group_list[i].api_list.length; k++) {
                        if (($rootScope.ssv_info.id ? $rootScope.ssv_info.id.toLowerCase() : '') == ($scope.cat.cat_list[j].group_list[i].api_list[k].api_id ? $scope.cat.cat_list[j].group_list[i].api_list[k].api_id.toLowerCase() : '')) {
                          $scope.cat.cat_list[j]._selectedItem = i
                          if (!$scope.apiCategoryId) {
                            $scope.apiCategoryId = $scope.cat.cat_list[j].cat_id
                            $scope.cat._selectedItem = j
                          }
                          if (!$scope.apiCategoryName) {
                            $scope.apiCategoryName = $scope.cat.cat_list[j].cat_name
                          }
                        }
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
        }).finally(() => {$scope.loading = false})
      }

      $scope.toAPIDetail = (api, cat) => {
        if (($scope.apiDetails.api_id == api.api_id) || $scope.refreshing) {return $q.reject()}

        $scope.refreshing = true
        let cat_id = cat.cat_id
        $scope.apiCategoryName = cat.cat_name
        cat_id && ($scope.apiCategoryId = cat_id)
        $scope.apiDetails = angular.extend({}, $scope.apiDetails, api)
        $scope.apiDetailQ = $scope.getAPIDetailQ($scope.apiDetails.api_id, $scope.apiCategoryId).then(() => {
          $rootScope.go('document.api', {id: api.api_id, cat_id: cat_id, cat_name: cat.cat_name})
        })
      }
      $scope.toDomainDetail = (domain, cat) => {
        if (($scope.domainDetails.domain_id == domain.domain_id) || $scope.refreshing) {return $q.reject()}

        $scope.refreshing = true
        let cat_id = cat.cat_id
        $scope.apiCategoryName = cat.cat_name
        cat_id && ($scope.apiCategoryId = cat_id)
        $scope.domainDetails = angular.extend({}, $scope.domainDetails, domain)
        $scope.domainDetailQ = $scope.getDomainDetailQ($scope.domainDetails.domain_id, $scope.apiCategoryId, false).then(() => {
          $rootScope.go('document.domain', {
            id: domain.domain_id, cat_id: cat_id, cat_name: cat.cat_name, sub_domain: false
          })
        })
      }
      $scope.changeAPISearch = () => {
        // 拷贝，并保留定位
        var cat = JSON.parse(JSON.stringify($scope.originalCat))
        if (cat.cat_list) {
          if ($scope.apiCategoryId) {
            for (let j = 0; j < cat.cat_list.length; j++) {
              if ($scope.apiCategoryId == cat.cat_list[j].cat_id) {
                cat._selectedItem = j
              }
              if (cat.cat_list[j].group_list) {
                cat.cat_list[j]._selectedItem = 0
                for (let i = 0; i < cat.cat_list[j].group_list.length; i++) {
                  if (cat.cat_list[j].group_list[i].api_list) {
                    for (let k = 0; k < cat.cat_list[j].group_list[i].api_list.length; k++) {
                      if ($scope.apiCategoryId == cat.cat_list[j].group_list[i].api_list[k].api_id) {
                        cat.cat_list[j]._selectedItem = i
                      }
                    }
                  }
                }
              }
            }
          } else if ($scope.cat) {
            for (let j = 0; j < cat.cat_list.length; j++) {
              cat._selectedItem = $scope.cat._selectedItem
              if (cat.cat_list && cat.cat_list[j] && cat.cat_list[j].group_list && $scope.cat.cat_list && $scope.cat.cat_list[j] && $scope.cat.cat_list[j].group_list) {
                cat.cat_list[j]._selectedItem = $scope.cat.cat_list[j]._selectedItem
              }
            }
          }
          $scope.cat = cat
        }
        if ($scope.cat.cat_list) {
          for (let j = 0; j < $scope.cat.cat_list.length; j++) {
            if ($scope.cat.cat_list[j].domain_list) {
              var k = $scope.cat.cat_list[j].domain_list.length
              while (k--) {
                (($scope.cat.cat_list[j].domain_list[k].domain_name.indexOf($scope.apiSearch) == -1) && ($scope.cat.cat_list[j].domain_list[k].domain_title.indexOf($scope.apiSearch) == -1)) && ($scope.cat.cat_list[j].domain_list.splice(k, 1))
              }
            }

            if ($scope.cat.cat_list[j].group_list) {
              for (let i = 0; i < $scope.cat.cat_list[j].group_list.length; i++) {
                if ($scope.cat.cat_list[j].group_list[i].api_list) {
                  var k1 = $scope.cat.cat_list[j].group_list[i].api_list.length
                  while (k1--) {
                    (($scope.cat.cat_list[j].group_list[i].api_list[k1].api_name.indexOf($scope.apiSearch) == -1) && ($scope.cat.cat_list[j].group_list[i].api_list[k1].api_title.indexOf($scope.apiSearch) == -1)) && ($scope.cat.cat_list[j].group_list[i].api_list.splice(k1, 1))
                  }
                }
              }
            }
          }
          if (!$scope.apiCategoryId) {
            let j = $scope.cat.cat_list.length
            while (j--) {
              if ($scope.cat.cat_list[j].group_list) {
                let k = $scope.cat.cat_list[j].group_list.length
                while (k--) {
                  if ($scope.cat.cat_list[j].group_list[k].api_list && ($scope.cat.cat_list[j].group_list[k].api_list.length == 0)) {
                    if ($scope.cat.cat_list[j].group_list.length > 1) {
                      $scope.cat.cat_list[j].group_list.splice(k, 1)
                    } else if ($scope.cat.cat_list.length > 1) {
                      $scope.cat.cat_list.splice(j, 1)
                    } else if ($scope.cat.cat_list.length == 1) {
                      cat.cat_list[j]._selectedItem = j
                    }
                  }
                }
              }
            }
          }
        }
      }
      $scope.catQ = getCatQ()
      $scope.reset = () => {
        $scope.breadcrumbs = []
        $scope.apiDetails = $scope.defaultDetails
        $scope.domainDetails = $scope.defaultDetails
        $scope.selectedEntry = 0
        $scope.apiSearch && $scope.catQ.then(() => {
          $scope.apiSearch = ''
          $scope.changeAPISearch()
          return $q.when()
        })
        $scope.apiCategoryId = undefined
        $scope.apiCategoryName = undefined
        $scope.refreshing = false
        //$rootScope.ssv_info && (delete $rootScope.ssv_info.id);
      }
      $scope.reset()
      $scope.resetView = () => {
        if ($scope.refreshing) {return}

        $scope.reset()
        $rootScope.go('document')
      }
      $scope.getAPIDetailQ = (api_id, locate) => {
        return $scope.catQ.then(() => {
          return $rootScope.ajax('api_detail', {api_id: api_id}).then(data => {
            if (data && data.data_list && data.data_list.length) {
              $scope.apiDetails = angular.extend($scope.apiDetails, data.data_list[0])
            } else {
              $scope.apiDetails = $scope.defaultDetails
            }
            $scope.breadcrumbs = [$scope.apiDetails]
            $scope.apiDetails.api_id = api_id
            !$scope.apiCategoryId && ($scope.apiCategoryId = $scope.apiDetails.cat_id)
            !$scope.apiCategoryName && ($scope.apiCategoryName = $scope.apiDetails.cat_name)
            $scope.selectedEntry = 0;

            ($scope.apiDetails.api_desc) && ($scope.apiDetails.api_desc_expanded = true);
            ($scope.apiDetails.sysparam_expanded = false);
            ($scope.apiDetails.request_parameter_type) && ($scope.apiDetails.request_parameter_type_expanded = true);
            ($scope.apiDetails.request_parameter_example) && ($scope.apiDetails.request_parameter_example_expanded = true);
            ($scope.apiDetails.response_parameter_desc) && ($scope.apiDetails.response_parameter_desc_expanded = true);
            ($scope.apiDetails.response_parameter_example) && ($scope.apiDetails.response_parameter_example_expanded = true);
            ($scope.apiDetails.busparam && $scope.apiDetails.busparam.length) && ($scope.apiDetails.busparam_expanded = true);
            ($scope.apiDetails.result && $scope.apiDetails.result.length) && ($scope.apiDetails.result_expanded = true)

            $scope.apiDetails.return_example_xml && ($scope.apiDetails.return_example_xml_expanded = true);
            ($scope.apiDetails.error_example_xml_expanded = false)
            $scope.apiDetails.buserror && ($scope.apiDetails.buserror_expanded = true);
            ($scope.apiDetails.syserror_expanded = false);
            ($scope.apiDetails.debug_expanded = true)

            try {
              if (!$scope.selectedEntry && $scope.apiCategoryId) {
                let return_example_xml = $filter('unescapeHtml')($scope.apiDetails.return_example_xml, 'xml'),
                  error_example_xml = $filter('unescapeHtml')($scope.apiDetails.error_example_xml, 'xml'),
                  return_example_json = $filter('unescapeHtml')($scope.apiDetails.return_example_json, 'json'),
                  error_example_json = $filter('unescapeHtml')($scope.apiDetails.error_example_json, 'json')

                packageTree(return_example_xml || '')
                packageTreeError(error_example_xml || '')
                Process(return_example_json || '{}')
                ProcessError(error_example_json || '{}')
              }
            } catch (e) {
              window.teste = e
            }

            $timeout(() => {
              if (locate && $scope.cat.cat_list) {
                for (let j = 0; j < $scope.cat.cat_list.length; j++) {
                  if ($scope.cat.cat_list[j].group_list) {
                    for (let i = 0; i < $scope.cat.cat_list[j].group_list.length; i++) {
                      //$scope.cat.cat_list[j].group_list[i].dynamicAPIItems = new DynamicItems($scope.cat.cat_list[j].group_list[i].api_list);
                      if ($scope.cat.cat_list[j].group_list[i].api_list) {
                        for (let k = 0; k < $scope.cat.cat_list[j].group_list[i].api_list.length; k++) {
                          if (api_id == $scope.cat.cat_list[j].group_list[i].api_list[k].api_id) {
                            $scope.cat.cat_list[j].group_list[i]._api_index = k
                          }
                        }
                      }
                    }
                  }
                }
              }
            }, 300)
          })
        }).finally(() => {
          $rootScope.ssv_info && (delete $rootScope.ssv_info.id)
          $scope.refreshing = false
          window.rxStream && window.rxStream.track('rop_ssv_document_visit', {
            properties: {
              'b_rop_ssv_document_name': $scope.apiDetails && $scope.apiDetails.api_name || '未知页面'
            }
          })
        })
      }
      ($state.current.name == 'document.api') && ($scope.apiDetailQ = $scope.getAPIDetailQ($state.params.id, (window.ssv_info && window.ssv_info.cat_id)))
      $scope.getDomainDetailQ = (domain_id, locate, sub_domain) => {
        return $scope.catQ.then(() => {
          return $rootScope.ajax('domain_detail', {domain_id: domain_id}).then(data => {
            if (data && data.data_list && data.data_list.length) {$scope.domainDetails = data.data_list[0]}
            else {$scope.domainDetails = $scope.defaultDetails}
            //sub_domain ? $scope.breadcrumbs.push($scope.domainDetails) : ($scope.breadcrumbs = [$scope.domainDetails])
            $scope.breadcrumbs = [$scope.domainDetails]
            $scope.domainDetails.domain_id = domain_id
            !$scope.apiCategoryId && ($scope.apiCategoryId = $scope.domainDetails.cat_id)
            !$scope.apiCategoryName && ($scope.apiCategoryName = $scope.domainDetails.cat_name)
            $scope.selectedEntry = 1;
            ($scope.domainDetails.domain_desc) && ($scope.domainDetails.domain_desc_expanded = true);
            ($scope.domainDetails.property) && ($scope.domainDetails.property_expanded = true)

            /** 因为Tab切换会有动画延迟，ngif做成时间较晚，所以定位不能在此定位，需要等待一个切tab时间后再设top index */
            $timeout(() => {
              let j = $scope.cat._selectedItem
              if (sub_domain && $scope.cat.cat_list && $scope.cat.cat_list[j] && $scope.cat.cat_list[j].group_list) {
                for (let i = 0; i < $scope.cat.cat_list[j].group_list.length; i++) {
                  $scope.cat.cat_list[j]._domain_index = 0
                  if ($scope.cat.cat_list[j].domain_list) {
                    for (let k = 0; k < $scope.cat.cat_list[j].domain_list.length; k++) {
                      if ($scope.cat.cat_list[j].domain_list[k].domain_id.toLowerCase() == $scope.domainDetails.domain_id.toLowerCase()) {
                        $scope.cat.cat_list[j]._domain_index = k
                      }
                    }
                  }
                }
              }
            }, 500)
          })
        }).finally(() => {
          $rootScope.ssv_info && (delete $rootScope.ssv_info.id)
          $scope.refreshing = false
          window.rxStream && window.rxStream.track('rop_ssv_document_visit', {
            properties: {
              'b_rop_ssv_document_name': $scope.domainDetails && $scope.domainDetails.domain_name || '未知页面'
            }
          })
        })
      }
      ($state.current.name == 'document.domain') && ($scope.domainDetailQ = $scope.getDomainDetailQ($state.params.id, (window.ssv_info && window.ssv_info.cat_id), true))
      $scope.selectEntry = entry => {
        $scope.selectedEntry = entry
        if ($scope.refreshing) {return}
        if (!entry && $scope.apiDetails && $scope.apiDetails.api_id) {
          if (($state.current.name != 'document.api') && ($state.current.name != 'document')) {
            $rootScope.go('document.api', {
              id: $scope.apiDetails.api_id,
              cat_id: $scope.apiCategoryId,
              cat_name: $scope.apiCategoryName
            })
          }
        } else if (entry && $scope.domainDetails && $scope.domainDetails.domain_id) {
          if (($state.current.name != 'document.domain') && ($state.current.name != 'document')) {
            $rootScope.go('document.domain', {
              id: $scope.domainDetails.domain_id,
              cat_id: $scope.apiCategoryId,
              cat_name: $scope.apiCategoryName
            })
          }
        }
      }
      $scope.toSubDomain = (domain_id, details) => {
        if ($scope.refreshing || !domain_id) {return $q.reject()}
        $scope.refreshing = true
        /*$rootScope.go('document.domain', {
          id: domain_id,
          cat_id: $scope.apiCategoryId,
          cat_name: $scope.apiCategoryName,
          sub_domain: true
        })*/
        $scope.domainDetailQ = $scope.getDomainDetailQ(domain_id, $scope.apiCategoryId, false).then(() => {
          $rootScope.go('document.domain', {
            id: domain_id, cat_id: $scope.apiCategoryId, cat_name: $scope.apiCategoryName, sub_domain: true
          })
        })
      }
      $scope.levelHint = $event => {
        $event.preventDefault()
        $event.stopPropagation()
        let parentEl = angular.element(document.body)
        $mdDialog.show({
          /*parent: parentEl,*/
          targetEvent: $event,
          clickOutsideToClose: true,
          fullscreen: false,
          template: `
                    <md-dialog aria-label="List dialog" class="level-description">
                        <md-dialog-content style="padding: 32px;">
                            <p><span style="font-size:12px;">开放平台API目前分为低级、中级、高级，根据API的等级不同，需要使用对应的调用方式。</span></p>        
                            <p><md-button class="md-raised low-rank" aria-label="Settings">初级API</md-button>可以使用ACCESS_TOKEN模式和安全签名方式进行调用</p>
                            <p><md-button class="md-raised medium-rank" aria-label="Settings">中级API</md-button>可以使用ACCESS_TOKEN模式和安全签名方式进行调用</p>
                            <p><md-button class="md-raised high-rank" aria-label="Settings">高级API</md-button>只可以使用安全签名方式进行调用。</p>
                            <br /> 
                            <p><span style="font-size:12px;">供应商在发布API时，目前系统会自动根据供应商安全等级分配API调用等级，后续版本将会开放供应商自行设置API调用等级。</span></p>
                            <p><span style="font-size:12px;">当API调用等级比较低时，供应商应处理好服务器的调用安全性，确保数据的安全。</span></p>
                            <p><span style="font-size:12px;">开发者在调用初级和中级API时，必须使用https方式进行调用，保证数据传输中的安全性。</span></p>
                            <br />
                            <p>具体调用方式请参照</p>
                            <p><a href="http://open.rongcapital.cn/welcome/doc/4D41D81C-CBB1-4567-8D15-ACC16EE025C8" target="_blank">Secret签名模式调用API </a></p>
                            <p><a href="http://open.rongcapital.cn/welcome/doc/1109A17A-5873-420E-A590-C4CE6C5A2D59" target="_blank">ACCESS_TOKEN模式调用API</a></p>
                            <p><a href="http://open.rongcapital.cn/welcome/doc/792E3864-2481-42B9-9CD2-4D4B83F3B294" target="_blank">前端调用模式说明</a></p>
                        </md-dialog-content>
                        <md-dialog-actions>
                            <md-button ng-click="closeDialog()" class="md-raised">关闭我</md-button>
                        </md-dialog-actions>
                    </md-dialog>`,
          controller: DialogController
        })
        function DialogController ($scope, $mdDialog) {
          $scope.closeDialog = () => {
            $mdDialog.hide()
          }
        }
      }
      $scope.initClipboard = (cliper) => {
        let _lang = $cookies.get('_lang')
        cliper.beforeClipboardCopy = (_lang == 'zh-cn') ? '复制文档地址' : 'Copy document URL'
        cliper.afterClipboardCopy = (_lang == 'zh-cn') ? '已复制' : 'Copied'
        cliper.workaroundSupportClipboard = action => {
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
        }
        $scope.clipboardHints = cliper.beforeClipboardCopy
      }

      window.test = $scope
      $rootScope.removeLoading()
    }])
  .controller('APICtrl', ['$rootScope', '$scope', '$http', '$filter', '$q', '$cookies', '$stateParams', '$mdSidenav', '$mdDialog', '$timeout', '$state',
    ($rootScope, $scope, $http, $filter, $q, $cookies, $stateParams, $mdSidenav, $mdDialog, $timeout, $state) => {
      let api_id = $stateParams.id, cliperParam = {}
      if ($scope.apiDetails && $scope.apiDetails.api_id && (api_id.toLowerCase() != $scope.apiDetails.api_id.toLowerCase()) || !$scope.apiCategoryId || (!$scope.apiDetails || !$scope.apiDetails.api_id)) {
        $scope.$parent.apiDetails = $scope.defaultDetails
        $scope.apiDetailQ = $scope.getAPIDetailQ(api_id, (window.ssv_info && window.ssv_info.cat_id || $scope.apiCategoryId))
      }
      $scope.$parent.selectedEntry = 0
      try {
        if (!$scope.selectedEntry && $scope.apiCategoryId) {
          let return_example_xml = $filter('unescapeHtml')($scope.apiDetails.return_example_xml, 'xml'),
            error_example_xml = $filter('unescapeHtml')($scope.apiDetails.error_example_xml, 'xml'),
            return_example_json = $filter('unescapeHtml')($scope.apiDetails.return_example_json, 'json'),
            error_example_json = $filter('unescapeHtml')($scope.apiDetails.error_example_json, 'json')

          packageTree(return_example_xml || '')
          packageTreeError(error_example_xml || '')
          Process(return_example_json || '{}')
          ProcessError(error_example_json || '{}')
        }
      } catch (e) {
        window.teste = e
      }
      if (window.ssv_info.cat_id) {
        $scope.apiDetailQ.then(() => {
          $timeout(() => {
            var activeElement = document.querySelector('body .document .section-wrapper section md-sidenav.md-sidenav-left.collapsed .md-expand>md-content md-list-item.active')
            activeElement && (activeElement.scrollIntoViewIfNeeded())
          }, 500)
          $scope.copyToClipboard = details => {
            let id = details.api_id ? details.api_id : details.domain_id,
              method = details.api_id ? 'ApiMethod' : 'ApiDomain'
            return `${Constant.protocol}://${Constant.host}/api/${method}-${id}.html`
          }
        })
        delete window.ssv_info.cat_id
        delete window.ssv_info.cat_name
      } else {
        $timeout(() => {
          $scope.apiDetailQ.then(() => {
            $timeout(() => {
              var activeElement = document.querySelector('body .document .section-wrapper section md-sidenav.md-sidenav-left.collapsed .md-expand>md-content md-list-item.active')
              activeElement && (activeElement.scrollIntoViewIfNeeded())
            }, 500)
            $scope.copyToClipboard = details => {
              let id = details.api_id ? details.api_id : details.domain_id,
                method = details.api_id ? 'ApiMethod' : 'ApiDomain'
              return `${Constant.protocol}://${Constant.host}/api/${method}-${id}.html`
            }
          })
        }, 100)
      }

      $scope.initClipboard(cliperParam)

      let cliper = new Clipboard('.cliper'), copying = false
      cliper.on('success', e => {
        if ($scope.clipboardHints == cliperParam.beforeClipboardCopy) {
          e.clearSelection()
          $timeout(() => {
            $scope.clipboardHints = cliperParam.afterClipboardCopy
          })
          $timeout(() => {
            $scope.clipboardHints = cliperParam.beforeClipboardCopy
          }, 3000)
        }
      })

      cliper.on('error', e => {
        if ($scope.clipboardHints == cliperParam.beforeClipboardCopy) {
          $timeout(() => {
            $scope.clipboardHints = cliperParam.workaroundSupportClipboard(e.action)
          })
          $timeout(() => {
            $scope.clipboardHints = cliperParam.beforeClipboardCopy
          }, 3000)
        }
      })

      window.test1 = $scope
      $scope.$on('$destroy', function () {
        cliper && cliper.destroy()
        if (($state.current.name != 'document.api') && ($state.current.name != 'document.domain')) {$scope.reset()}
      })
    }])
  .controller('DomainCtrl', ['$rootScope', '$scope', '$http', '$filter', '$q', '$cookies', '$stateParams', '$mdSidenav', '$mdDialog', '$timeout', '$state',
    ($rootScope, $scope, $http, $filter, $q, $cookies, $stateParams, $mdSidenav, $mdDialog, $timeout, $state) => {
      let domain_id = $stateParams.id, sub_domain = $stateParams.sub_domain, cliperParam = {}
      if ($scope.domainDetails && $scope.domainDetails.domain_id && (domain_id.toLowerCase() != $scope.domainDetails.domain_id.toLowerCase()) || !$scope.apiCategoryId ) {
        $scope.$parent.domainDetails = $scope.defaultDetails
        $scope.domainDetailQ = $scope.getDomainDetailQ(domain_id, (window.ssv_info && window.ssv_info.cat_id || $scope.apiCategoryId), sub_domain)
      }
      window.ssv_info.cat_id && $scope.$parent && ($scope.$parent.selectedEntry = 1)
      if (window.ssv_info.cat_id) {
        $scope.domainDetailQ.then(() => {
          $scope.copyToClipboard = details => {
            let id = details.api_id ? details.api_id : details.domain_id,
              method = details.api_id ? 'ApiMethod' : 'ApiDomain'
            return `${Constant.protocol}://${Constant.host}/api/${method}-${id}.html`
          }
        })
        delete window.ssv_info.cat_id
        delete window.ssv_info.cat_name
      } else {
        $timeout(() => {
          $scope.domainDetailQ.then(() => {
            $scope.copyToClipboard = details => {
              let id = details.api_id ? details.api_id : details.domain_id,
                method = details.api_id ? 'ApiMethod' : 'ApiDomain'
              return `${Constant.protocol}://${Constant.host}/api/${method}-${id}.html`
            }
          })
        }, 100)
      }
      $scope.$parent.selectedEntry = 1
      $scope.initClipboard(cliperParam)

      let cliper = new Clipboard('.cliper')
      cliper.on('success', e => {
        if ($scope.clipboardHints == cliperParam.beforeClipboardCopy) {
          e.clearSelection()
          $timeout(() => {
            $scope.clipboardHints = cliperParam.afterClipboardCopy
          })
          $timeout(() => {
            $scope.clipboardHints = cliperParam.beforeClipboardCopy
          }, 3000)
        }
      })

      cliper.on('error', e => {
        if ($scope.clipboardHints == cliperParam.beforeClipboardCopy) {
          $timeout(() => {
            $scope.clipboardHints = cliperParam.workaroundSupportClipboard(e.action)
          })
          $timeout(() => {
            $scope.clipboardHints = cliperParam.beforeClipboardCopy
          }, 3000)
        }
      })

      //window.test1 = $scope
      $scope.$on('$destroy', function () {
        cliper && cliper.destroy()
        if (($state.current.name != 'document.api') && ($state.current.name != 'document.domain')) {$scope.reset()}
      })
    }])
  .controller('FunctionCtrl', ['$rootScope', '$scope', '$http',
    ($rootScope, $scope, $http) => {
      $('a[href^="#"]', '#partials').click(e => {
        e.preventDefault()
      })

      let featureQ = $http.post('/agent', {
        module: 'supplier',
        partial: 'function',
        api: 'get_feature',
        param: {ssv_user_id: $rootScope.ssv_user_id}
      }).then(body => {
        if (body && body.data && body.data.user_desc) {
          $scope.ssv_feature = body.data.user_desc
        }
      }, why => {
        $rootScope.alert(why)
      })
      $scope.$on('$viewContentLoaded', event => {
        featureQ.finally(() => {
          $rootScope.removeLoading()
        })
      })
    }])
  .controller('InfoCtrl', ['$rootScope', '$scope', '$http',
    ($rootScope, $scope, $http) => {
      $('a[href^="#"]', '#partials').click(e => {
        e.preventDefault()
      })

      $scope.infos = []
      let pageIndex = 1, pageSize = 6, infoQ

      $scope.searcher = () => {
        $scope.loading = true
        return $http.post('/agent', {
          module: 'supplier',
          partial: 'info',
          api: 'infos',
          param: {pageindex: pageIndex, pagesize: pageSize, ssv_user_id: $rootScope.ssv_user_id}
        }).then(body => {
          let totalPages = (typeof body.data.page_count == 'number') ? body.data.page_count : (new Number(body.data.page_count))
          if (totalPages >= pageIndex) {
            if (body.data.data_list && body.data.data_list.length) {
              body.data.data_list.forEach((r, i) => {
                $scope.infos.push(r)
              })
              pageIndex++
            }
          }

          $scope.loading = false
        }, why => {
          $scope.loading = false
          $rootScope.alert(why)
        }).finally(() => {
          $scope.loaded = true
        })
      }
      infoQ = $scope.searcher()
      window.test = $scope

      $scope.$on('$viewContentLoaded', event => {infoQ.finally(() => {$rootScope.nextTick($rootScope.removeLoading)})})
    }])
  .controller('AllCommentCtrl', ['$rootScope', '$scope', '$http',
    ($rootScope, $scope, $http) => {
      $('a[href^="#"]', '#partials').click(e => {
        e.preventDefault()
      })

      $scope.comments = []

      $scope.searcher = () => {
        $scope.loading = true
        return $http.post('/agent', {
          module: 'supplier',
          partial: 'all-comment',
          api: 'comments',
          param: {ssv_user_id: $rootScope.ssv_user_id}
        }).then(body => {
          let totalPages = (typeof body.data.page_count == 'number') ? body.data.page_count : (new Number(body.data.page_count))
          if (body.data.data_list && body.data.data_list.length) {
            $.extend($scope.comments, body.data.data_list)
          }
          $scope.loading = false
        }, why => {
          $scope.loading = false
          $rootScope.alert(why)
        })
      }

      $scope.saveComment = () => {
        if ($scope.commentForm.$invalid) {
          $scope.commentForm.$error.required && $scope.commentForm.$error.required.forEach(r => {
            r.$setDirty(true)
          })
          $('#flash').addClass('warn')
          setTimeout(() => {
            $('#flash').removeClass('warn')
            //$('#loginPanel').removeClass('invalid');
            $scope.$digest()
          }, 1000)
          return
        }
        if (!$rootScope.profile) {
          $rootScope.showAdvanced()
          return
        }
        $http.post('/agent', {
          module: 'supplier',
          partial: 'all-comment',
          api: 'add',
          param: {comment_content: $scope.comment_content_area, ssv_user_id: $scope.ssv_user_id}
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            $scope.commentForm.$setPristine()
            $scope.comment_content_area = ''
            $scope.searcher()
          } else {
            $rootScope.warn(body.data.msg)
          }
        }, why => {
          $rootScope.alert(why)
        })
      }

      $scope.isCurrentSsv = () => {
        if (!$rootScope.profile || !$rootScope.ssv_intro) {
          return false
        }
        return ($rootScope.profile.login_user_name == $rootScope.ssv_intro.user_name)
      }
      $scope.toggleReply = comment => {
        comment._toggleReply = (!comment._toggleReply)
      }
      $scope.replyComment = comment => {
        comment._toggleReply = (!comment._toggleReply)
        setTimeout(() => {
          $http.post('/agent', {
            module: 'supplier',
            partial: 'all-comment',
            api: 'reply',
            param: {
              comment_id: comment.comment_id,
              comment_content: comment._comment_content,
              ssv_user_id: $scope.ssv_user_id
            }
          })
            .then(body => {
              if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
                delete comment._comment_content
                $scope.searcher()
              } else {
                $rootScope.alert(body.data.msg)
              }
            }, why => {
              $rootScope.alert(why)
            })
        }, 400)
      }
      $scope.isCreator = comment => {
        if (!$rootScope.profile || !comment) {
          return false
        }
        return ($rootScope.profile.login_user_name == comment.create_user)
      }
      $scope.deleteComment = (comment, comments) => {
        $http.post('/agent', {
          module: 'supplier',
          partial: 'all-comment',
          api: 'delete',
          param: {comment_id: comment.comment_id}
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            $scope.comment_content_area = ''
            comments.splice(comments.indexOf(comment), 1)
          } else {
            $rootScope.alert(body.data.msg)
          }
        }, why => {
          $rootScope.alert(why)
        })
      }

      $scope.checkID = () => {
        if (!$rootScope.profile) {
          return false
        }

        if ($rootScope.profile.id == $scope.ssv_user_id) {
          return true
        }

        return true
      }
      $scope.$on('$viewContentLoaded', event => {
        $scope.searcher().finally($rootScope.removeLoading)
      })
    }])
