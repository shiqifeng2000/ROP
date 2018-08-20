/**
 * Created by robin on 22/11/2016.
 */
/*define(['require', '../services'], function (require) {
 'use strict'


 })*/

let controllerModule = angular.module('dashboard.controllers', ['rop.services'])
controllerModule
  .controller('FrameCtrl', ['$rootScope', '$scope', '$stateParams',
    ($rootScope, $scope, $stateParams) => {
      $rootScope.validateEntry().then(() => {
        $scope.src = $stateParams.src
      })
    }])
  .controller('ErrorCtrl', ['$rootScope', '$scope', '$stateParams',
    ($rootScope, $scope, $stateParams) => {
      $rootScope.removeLoading()
      $scope.error = $stateParams.error
    }])
  .controller('MessageCtrl', ['$rootScope', '$scope', '$stateParams',
    ($rootScope, $scope, $stateParams) => {
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
  .controller('AppListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['dashboard/controllers/app_list'], (AppListCtrl) => {
        $injector.invoke(AppListCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('CautionListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['dashboard/controllers/caution'], (EnvironmentCtrl) => {
        $injector.invoke(EnvironmentCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('IpWhiteListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['dashboard/controllers/ipwhitelist'], (EnvironmentCtrl) => {
        $injector.invoke(EnvironmentCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('NotifyCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['dashboard/controllers/notifymanage'], (NotifyCtrl) => {
        $injector.invoke(NotifyCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('DomainWhiteListCtrl', ['$rootScope', ($rootScope) => {$rootScope.validateEntry()}])
  .controller('UserMailListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then((isOld) => {
      require(['dashboard/controllers/user_mail'], (UserMailListCtrl) => {
        $injector.invoke(UserMailListCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('AppCompanyListCtrl', ['$rootScope', ($rootScope) => {$rootScope.validateEntry()}])
  .controller('AppApiAssistIsvSandboxCtrl', ['$rootScope', '$scope', '$location', '$injector', 'ModuleLoader', '$q', ($rootScope, $scope, $location, $injector, ModuleLoader, $q) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['dashboard/controllers/appapiassistisvsandbox']), ModuleLoader.reload('angularCalendar', 'rop-date-range-picker,rop-date-picker', $scope)).then((result) => {
        $injector.invoke(result[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('AppApiAssistIsvCtrl', ['$rootScope', '$scope', '$location', '$injector', 'ModuleLoader', '$q', ($rootScope, $scope, $location, $injector, ModuleLoader, $q) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['dashboard/controllers/appapiassistisv']), ModuleLoader.reload('angularCalendar', 'rop-date-range-picker,rop-date-picker', $scope)).then((result) => {
        $injector.invoke(result[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('LogAnalyzeSandboxCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['dashboard/controllers/loganalyzesandbox']), ModuleLoader.reload('angularCalendar', 'rop-date-time-range-picker', $scope)).then((result) => {
        $injector.invoke(result[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('LogAnalyzeCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['dashboard/controllers/loganalyze']), ModuleLoader.reload('angularCalendar', 'rop-date-time-range-picker', $scope)).then((result) => {
        $injector.invoke(result[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('LogAnalyzeSandboxNewCtrl', ['$rootScope', ($rootScope) => {$rootScope.validateEntry()}])
  .controller('LogAnalyzeNewCtrl', ['$rootScope', ($rootScope) => {$rootScope.validateEntry()}])
  .controller('DownloadListCtrl', ['$rootScope', ($rootScope) => {$rootScope.validateEntry()}])
  .controller('SdkDownloadCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['dashboard/controllers/sdkdownload'], (SdkDownloadCtrl) => {
        $injector.invoke(SdkDownloadCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('IsvNoticeListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['dashboard/controllers/noticelist'], (IsvNoticeListCtrl) => {
        $injector.invoke(IsvNoticeListCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('SmsRechargeListCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['dashboard/controllers/sms_rechargelist']), ModuleLoader.reload('angularCalendar', 'rop-date-range-picker', $scope)).then((result) => {
        $injector.invoke(result[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('SmsBalanceListCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['dashboard/controllers/sms_balancelist']), ModuleLoader.reload('angularCalendar', 'rop-date-range-picker', $scope)).then((result) => {
        $injector.invoke(result[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('SmsSendListCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    $scope.noselection = true
    var self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['dashboard/controllers/smssendlist']), ModuleLoader.reload('angularCalendar', 'rop-date-range-picker', $scope)).then((result) => {
        $injector.invoke(result[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('SmsStatisticsCtrl', ['$rootScope', '$scope', '$location', '$injector', '$q', 'ModuleLoader', ($rootScope, $scope, $location, $injector, $q, ModuleLoader) => {
    $scope.noselection = true
    var self = this
    $rootScope.validateEntry().then(() => {
      $q.when(ModuleLoader.require(['dashboard/controllers/smsstatistics']), ModuleLoader.reload('angularCalendar', 'rop-date-range-picker', $scope)).then((result) => {
        $injector.invoke(result[0], self, {'$scope': $scope})
      })
    })
  }])
  .controller('SmsUserTemplateListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['dashboard/controllers/smsusertemplate'], (ctrl) => {
        $injector.invoke(ctrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('SubUserListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    var self = this
    $rootScope.validateEntry().then(() => {
      require(['dashboard/controllers/subuserlist'], (SubUserListCtrl) => {
        $injector.invoke(SubUserListCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('ProductUserListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['dashboard/controllers/productionuserlist'], (ProductUserListCtrl) => {
        $injector.invoke(ProductUserListCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
  .controller('ProductChargeListCtrl', ['$rootScope', '$scope', '$location', '$injector', ($rootScope, $scope, $location, $injector) => {
    let self = this
    $rootScope.validateEntry().then(() => {
      require(['dashboard/controllers/productionchargelist'], (ProductChargeListCtrl) => {
        $injector.invoke(ProductChargeListCtrl, self, {'$scope': $scope})
        $scope.$digest()
      })
    })
  }])
