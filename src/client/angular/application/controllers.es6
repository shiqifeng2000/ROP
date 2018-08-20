/**
 * Created by robin on 22/11/2016.
 */
/*define(['require', '../services'], function (require) {
 'use strict'


 })*/

let controllerModule = angular.module('application.controllers', ['rop.services', 'ngDragDrop'])
controllerModule
  .controller('FrameCtrl', ['$rootScope', '$scope', '$stateParams', ($rootScope, $scope, $stateParams) => {$rootScope.validateEntry().then(() => {$scope.src = $stateParams.src})}])
  .controller('ErrorCtrl', ['$rootScope', '$scope', '$stateParams', ($rootScope, $scope, $stateParams) => {
    $rootScope.removeLoading()
    $scope.error = $stateParams.error
  }])
  .controller('MessageCtrl', ['$rootScope', '$scope', ($rootScope, $scope) => {
      if (!$rootScope.checkSession()) {
        $rootScope.logout()
        return
      }
      $scope.columns = [
        {
          text: '消息内容',
          name: 'msg',
          style: {width: 'auto', 'text-align': 'left', padding: '0px 16px'},
          compile: '<div ng-bind="$parent.row.msg" ng-click="$parent.$parent.col.goStateViaURL($parent.row.msg_url, $parent.row.params)"></div>',
          goStateViaURL: $rootScope.goStateViaURL
        },
        {text: '添加时间', name: 'msg_time', style: {width: '160px', 'text-align': 'center'}}]
      $scope.noselection = true
      let changeTab = () => {
        if ($rootScope.rawSystemHints && $rootScope.rawSystemHints.length) {
          $scope.tableData = ($rootScope.rawSystemHints[$scope.index] || $rootScope.rawSystemHints[0]).pages
        } else {
          $scope.index = 0
          $scope.tableData = []
        }
      }
      $scope.reset = () => {
        $scope.refreshing = true
        $rootScope.refreshSystemHints().then(() => {
          $scope.index = 0
          $scope.tableData = $rootScope.rawSystemHints && $rootScope.rawSystemHints[0] && $rootScope.rawSystemHints[0].pages || []
        }).finally(() => {
          $scope.refreshing = false
        })
      }
      $scope.reset()
      $scope.changeIndex = (index) => {
        $scope.index = index
      }
      $scope.toPage = () => {
        if ($rootScope.rawSystemHints && $rootScope.rawSystemHints.length && (typeof $scope.index != 'undefined')) {
          $scope.goStateViaURL($rootScope.rawSystemHints[$scope.index].url)
        }
      }
      $scope.$watch(() => $rootScope.rawSystemHints, changeTab)
      $scope.$watch(() => $scope.index, changeTab)
      $rootScope.removeLoading()
      window.test = $scope
    }])
  .controller('APICtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/api'], (APIController) => {
        $injector.invoke(APIController, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('DomainCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/domain'], (DomainController) => {
        $injector.invoke(DomainController, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('AppCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/app_list'], (AppListCtrl) => {
        $injector.invoke(AppListCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('ISVAppCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/isv_app'], (ISVAppCtrl) => {
        $injector.invoke(ISVAppCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('EnvironmentCtrl', ['$rootScope',($rootScope) => {$rootScope.validateEntry()}])
  .controller('EnvironmentAppCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/env_app'], (EnvironmentCtrl) => {
        $injector.invoke(EnvironmentCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('EnvironmentSetCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/env_set'], (EnvironmentCtrl) => {
        $injector.invoke(EnvironmentCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('APIFlowCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/flow'], (APIFlowCtrl) => {
        $injector.invoke(APIFlowCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('APICautionCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/caution'], (EnvironmentCtrl) => {
        $injector.invoke(EnvironmentCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('CategoryCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/category'], (CategoryCtrl) => {
        $injector.invoke(CategoryCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('CategoryGroupCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/category_group'], (CategoryGroupCtrl) => {
        $injector.invoke(CategoryGroupCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('NoApplyCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/no_apply'], (NoApplyCtrl) => {
        $injector.invoke(NoApplyCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('AuthorityCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/authority'], (AuthorityCtrl) => {
        $injector.invoke(AuthorityCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('MailCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/user_mail'], (MailCtrl) => {
        $injector.invoke(MailCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('NotifyCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/notify'], (NotifyCtrl) => {
        $injector.invoke(NotifyCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('PingCtrl', ['$rootScope', ($rootScope) => {$rootScope.validateEntry()}])
  .controller('SandboxLogAssistCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['application/controllers/assist_sandbox']), ModuleLoader.reload('angularCalendar', 'rop-date-range-picker', $scope)).then((result) => {
        $injector.invoke(result[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('LogAssistCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['application/controllers/assist']), ModuleLoader.reload('angularCalendar', 'rop-date-range-picker', $scope)).then((result) => {
        $injector.invoke(result[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('SandboxLogAnalysisCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['application/controllers/analysis_sandbox']), ModuleLoader.reload('angularCalendar', 'rop-date-time-range-picker', $scope)).then((results) => {
        $injector.invoke(results[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('LogAnalysisCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['application/controllers/analysis']), ModuleLoader.reload('angularCalendar', 'rop-date-time-range-picker', $scope)).then((results) => {
        $injector.invoke(results[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('DownloadCtrl', ['$rootScope', ($rootScope) => {$rootScope.validateEntry()}])
  .controller('DocCtrl', ['$rootScope', '$scope', '$location', '$injector', '$timeout', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $timeout, ModuleLoader) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/doc', 'ckeditor'], ctrl => {
        $injector.invoke(ctrl, self, {'$scope': $scope})
        $scope.$digest()
        $timeout(() => {
          // CK Editor 需要可视范围内的操作，所以这里需要等待页面可以看到再加载
          ModuleLoader.reload('angularEditor', 'rop-editor,[rop-editor]', $scope)
        }, 100)
      })
    })
  }])
  .controller('NoticeCtrl', ['$rootScope', '$scope', '$location', '$injector', '$timeout', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $timeout, ModuleLoader) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/notice', 'ckeditor'], ctrl => {
        $injector.invoke(ctrl, self, {'$scope': $scope})
        $scope.$digest()
        $timeout(() => {
          // CK Editor 需要可视范围内的操作，所以这里需要等待页面可以看到再加载
          ModuleLoader.reload('angularEditor', 'rop-editor,[rop-editor]', $scope)
        }, 100)
      })
    })
  }])
  .controller('ToolDownloadCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/tool_download'], (ToolDownloadCtrl) => {
        $injector.invoke(ToolDownloadCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('SDKCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/sdk'], (SDKCtrl) => {
        $injector.invoke(SDKCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('FunctionCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    var self = this
    window.CKEDITOR && (window.CKEDITOR.disableAutoInline = true)
    $rootScope.validateEntry().then(() => {
      // angularFileUpload在外部是因为不需要第三方lib支持，editor在内部是因为需要有ckeditor库支持，ckeditor初始化需要页面有元素
      if (ModuleLoader._loader.isLoaded('ngFileUpload')) {
        require(['application/controllers/function', 'ckeditor'], (ctrl) => {
          $injector.invoke(ctrl, self, {'$scope': $scope, 'ModuleLoader': ModuleLoader})
        })
      } else {
        // upload插件放在前面因为后面controller里有对upload的依赖
        $q.all([ModuleLoader.reload('angularFileUpload', '[ngf-drop],[ngf-select],[ngf-src]', $scope), ModuleLoader.require(['application/controllers/function', 'ckeditor'])]).then((result) => {
          $injector.invoke(result[1][0], self, {'$scope': $scope, 'ModuleLoader': ModuleLoader})
        })
      }
    })
  }])
  .controller('SubUserCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/subuser'], (SubUserCtrl) => {
        $injector.invoke(SubUserCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('ProductListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/productlist'], (APIController) => {
        $injector.invoke(APIController, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('ProductUserListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/productionuserlist'], (ProductUserListCtrl) => {
        $injector.invoke(ProductUserListCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('ProductChargeListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/productionchargelist'], (ProductChargeListCtrl) => {
        $injector.invoke(ProductChargeListCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('DataRoleSetCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['application/controllers/dataroleset'], (DataRoleSetCtrl) => {
        $injector.invoke(DataRoleSetCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
