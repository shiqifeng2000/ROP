/**
 * Created by robin on 22/11/2016.
 */

define([], function () {
  'use strict'
  return ['$rootScope', '$scope', '$http', '$mdDialog', '$q', '$stateParams', '$location', ($rootScope, $scope, $http, $mdDialog, $q, $stateParams, $location) => {
    // TODO 石奇峰邀请您来维护以下代码，以下代码分为4大部分，api列表操作部，api修改部，api排序部，免审核部， 3个页内弹窗，缓存，日志，下载， 1个页外弹窗，预览

    $scope.mode = 0
    $scope.enterMode = (mode, cb) => {
      $scope.mode = mode
      cb && cb.call()
    }
    $scope.exitMode = (cb) => {
      $scope.mode = 0
      $scope.cancelStep()
      cb && cb.call()
    }

    //TODO 有接口后根据接口做一下变动
    $scope.toggleFilterPanel = (e) => {
      $scope.showFilterPanel = !$scope.showFilterPanel
      $scope.showBatchPanel = false
    }

    $scope.toggleBatchPanel = (e) => {
      $scope.showBatchPanel = !$scope.showBatchPanel
      $scope.showFilterPanel = false
    }
    $scope.$watch('batch', () => {
      if ($scope.batch) {$scope.showFilterPanel = true}
      //else{$scope.showFilterPanel = false;}
    })
    $scope.orders = [
      {name: 'ruixue.external.items.get', cat: '商品API', des: '1.获取商品数据 注：不填写查询参数时默认为查询所有的商品信息。'},
      {name: 'ruixue.external.items.get', cat: '商品API', des: '2.获取商品数据 注：不填写查询参数时默认为查询所有的商品信息。'},
      {name: 'ruixue.external.items.get', cat: '商品API', des: '3.获取商品数据 注：不填写查询参数时默认为查询所有的商品信息。'},
    ]

    let ExportController = (scope, $mdDialog) => {
      scope.test_url = '0'
      scope.online_url = '0'
      let exportFile = () => {
        scope.exporting = true
        return $scope.ajax('api_export', {
          keyword: $scope.keyword,
          cat_id: $scope.panelSelection.panelCat.cat_id,
          group_id: $scope.panelSelection.panelCatGroup.group_id,
          status: $scope.panelSelection.panelStatus.status_id,
          sort_name: $scope.panelSelection.sorter.name,
          sort_flag: $scope.panelSelection.sorter.sort,
          test_url: scope.test_url,
          online_url: scope.online_url
        }).then((data) => {
          if ($rootScope.browserType == 'Chrome') {
            // TODO 因为没有放入document里，所以这里可以不用detach
            let a = window.document.createElement('a')
            a.href = data.export_url
            a.download = true
            a.click()
          } else if ($rootScope.browserType == 'Safari') {
            window.location.href = data.export_url
          } else {
            window.open(data.export_url, '_blank')
          }
          return data
        }).finally(()=>{
          scope.exporting = false
        })
      }
      scope.triggerExport = () => {
        if (scope.exporting) {return}
        exportFile().then(data => {if (data) {return $mdDialog.hide()}})
      }
      scope.closeExport = () => $mdDialog.hide()
    }
    $scope.showExport = (ev) => {
      $mdDialog.show({
        controller: ExportController,
        template: `<md-dialog aria-label="Mango (Fruit)" style="width: 256px">
                                <md-dialog-content class="md-dialog-content">
                                    <div class="md-dialog-content-body">
                                        <md-checkbox ng-model="test_url" aria-label="Checkbox 1" class="md-primary" ng-true-value="'1'" ng-false-value="'0'" >测试URL</md-checkbox>
                                        <md-checkbox ng-model="online_url" aria-label="Checkbox 2" class="md-primary" ng-true-value="'1'" ng-false-value="'0'" >正式URL</md-checkbox>
                                    </div>
                                </md-dialog-content>
                                <md-dialog-actions layout="row">
                                  <md-button ng-click="closeExport()">
                                    取消
                                  </md-button>
                                  <md-button ng-click="triggerExport()">
                                   导出
                                  </md-button>
                                </md-dialog-actions>
                            </md-dialog>`,
        /*parent: angular.element(document.body),*/
        parent: angular.element(document.querySelector('body>section>md-content')),
        targetEvent: ev,
        clickOutsideToClose: true,
        //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      })
    }

    // 主页面的功能数据
    // TODO API模式Call Mode，添加时，2为secret，0为全部，和账户信息的flag正好相反， from ZhangBaoYu
    $scope.panelSelection = {}
    let initCat = {cat_id: '', cat_name: '全部分类'}, initGroup = {
        group_id: '',
        group_name: ''
      }, initStatus = {status_id: '', status_name: '全部状态'},
      callMode = {'2': {id: '0', label: 'SECRET'}, '0': {id: '2', label: '全部'}}
    $scope.reset = () => {
      $scope.panelSelection.panelCat = {cat_id: '', cat_name: '全部分类'}
      $scope.panelSelection.panelCatGroup = {group_id: '', group_name: ''}
      $scope.panelSelection.panelStatus = initStatus
      $scope.panelSelection.sorter = {name: '', sort: '1'}
      $scope.columns = [
        {text: 'API标题', name: 'api_title', tooltip: true, sort: '1'},
        {
          text: 'API名称',
          name: 'api_name',
          tooltip: true,
          sort: '1',
          linker: {
            create: row => {return `${Constant.protocol}://${Constant.host}:${Constant.port}/api/ApiPreview-${row.api_id}.html`},
            target: '_blank'
          }
        },
        {text: 'API类型', name: 'cat_id', style: {width: '128px', 'text-align': 'center'}},
        {
          text: '状态',
          name: 'status_name',
          tooltiper: row => ((row.status == '101') || (row.status == '103') || (row.status == '105')) ? row.refuse_reason : '',
          style: {width: '112px', 'text-align': 'center'}
        },
        {text: '停用状态', name: 'use_yn', style: {width: '88px', 'text-align': 'center'}},
        {text: '添加时间', name: 'create_time', sort: '1', style: {width: '160px', 'text-align': 'center'}}]
      $scope.keyword = ''
      $scope.batch = false
      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
      //$scope.searcher();
    }
    // 如果传入参数则自动定位到待办事项上
    if ($stateParams.api_name) {
      $scope.panelSelection.panelCat = {cat_id: '', cat_name: '全部分类'}
      $scope.panelSelection.panelCatGroup = {group_id: '', group_name: ''}
      $scope.panelSelection.panelStatus = initStatus
      $scope.panelSelection.sorter = {name: '', sort: '1'}
      $scope.columns = [
        {text: 'API标题', name: 'api_title', tooltip: true, sort: '1'},
        {
          text: 'API名称',
          name: 'api_name',
          tooltip: true,
          sort: '1',
          linker: {
            create: row => {return `${Constant.protocol}://${Constant.host}:${Constant.port}/api/ApiPreview-${row.api_id}.html`},
            target: '_blank'
          }
        },
        {text: 'API类型', name: 'cat_id', style: {width: '128px', 'text-align': 'center'}},
        {
          text: '状态',
          name: 'status_name',
          tooltiper: row => ((row.status == '101') || (row.status == '103') || (row.status == '105')) ? row.refuse_reason : '',
          style: {width: '112px', 'text-align': 'center'}
        },
        {text: '停用状态', name: 'use_yn', style: {width: '88px', 'text-align': 'center'}},
        {text: '添加时间', name: 'create_time', sort: '1', style: {width: '160px', 'text-align': 'center'}}]
      $scope.keyword = $stateParams.api_name
      $scope.batch = false
      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
    } else {
      $scope.reset()
    }

    $scope.chooseCat = (cat, group) => {
      $scope.panelSelection.panelCat = cat || {cat_id: '', cat_name: '全部分类'}
      $scope.panelSelection.panelCatGroup = group || initGroup
      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
      //$scope.searcher();
    }
    $scope.chooseStatus = (status) => {
      $scope.panelSelection.panelStatus = status || {status_id: '', status_name: '全部状态'}

      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
      //$scope.searcher();
    }
    //$scope.pageSize = 10;
    $scope.searcher = (index, size) => {
      $scope.refreshing = true
      /*return $http.post('/agent', {
       module: 'application', partial: 'api', api: 'api_list',
       param: {
       pageindex: index ? index : $scope.pageIndex,
       pagesize: size ? size : $scope.pageSize,
       keyword: $scope.keyword,
       cat_id: $scope.panelSelection.panelCat.cat_id,
       group_id: $scope.panelSelection.panelCatGroup.group_id,
       status: $scope.panelSelection.panelStatus.status_id,
       sort_name: $scope.panelSelection.sorter.name,
       sort_flag: $scope.panelSelection.sorter.sort,
       }
       }).then(body => {
       if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
       $scope.tableData = body.data.data_list;
       $scope.total = body.data.list_count;
       } else {
       $rootScope.alert(body.data.msg);
       $scope.total = 0;
       }
       $scope.refreshing = false;
       }, why => {
       $rootScope.alert(why);
       $scope.total = 0;
       $scope.refreshing = false;
       });*/
      var previous = $scope.tableData && $scope.tableData._select
      return $scope.ajax('api_list', {
        pageindex: index || $scope.pageIndex,
        pagesize: size || $scope.pageSize,
        keyword: $scope.keyword,
        cat_id: $scope.panelSelection.panelCat.cat_id,
        group_id: $scope.panelSelection.panelCatGroup.group_id,
        status: $scope.panelSelection.panelStatus.status_id,
        sort_name: ($scope.panelSelection.sorter.name == 'create_time') ? 'rx_insertTime' : $scope.panelSelection.sorter.name,
        sort_flag: $scope.panelSelection.sorter.sort,
      }, (data) => {
        if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
          $scope.tableData = data.data_list
          $scope.total = data.list_count
          if ($scope.tableData && $scope.tableData[0]) {
            if (previous) {
              $scope.tableData._select = [].concat.apply([], $scope.tableData.map(r => ((previous.api_id == r.api_id) ? [r] : [])))[0] || $scope.tableData[0]
            } else {
              $scope.tableData._select = $scope.tableData[0]
            }
          }
        } else {
          $rootScope.warn(data.msg)
          $scope.total = 0
        }
      }, () => {
        $scope.total = 0
      }).finally(() => {
        $scope.refreshing = false
      })
    }
    $scope.tableData = []
    $scope.research = () => {
      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
    }
    let mainQ = $scope.ajax('init', (data) => {
      $scope.originalPanel = JSON.parse(JSON.stringify(data))
      $scope.panel = data
    })
    $scope.canVisistAPI = () => $scope.tableData && $scope.tableData._select
    $scope.canRemindAPI = () => $scope.tableData && $scope.tableData._select && ($scope.tableData._select.status == '4')
    $scope.canUrlEdit = () => $scope.tableData && $scope.tableData._select && $rootScope.validateBtnRole('btnUrlEdit')
    $scope.canParamCheck = () => $scope.tableData && $scope.tableData._select && $rootScope.validateBtnRole('btnParamCheck')
    $scope.canInsertAPI = () => $rootScope.validateBtnRole('btnInsert')
    $scope.canInsertFrontAPI = () => $rootScope.validateBtnRole('btnFrontInsert')
    $scope.canVisitCacheAPI = () => $rootScope.validateBtnRole('btnCache') && $scope.tableData && $scope.tableData._select
    $scope.canApplyAuditAPI = (array) => {
      if (!array || !array.length || !array[0]) {
        return false
      }
      let result = true
      array.forEach((r, i) => {
        ((r.status != '0') && (r.status != '101') || (r.is_old != '0')) && (result = false)
      })
      return result
    }
    $scope.canDeleteAPI = (array) => {
      if (!array || !array.length || !array[0]) {
        return false
      }
      let result = true
      array.forEach((r, i) => {
        ((r.status != '0') && (r.status != '1') && (r.status != '2') || (r.is_old != '0')) && (result = false)
      })
      return result
    }
    $scope.canUpdateAPI = (array) => {
      if (!array || !array.length || !array[0]) {
        return false
      }
      let result = true
      array.forEach((r, i) => {
        ((r.status != '0') && (r.status != '1') && (r.status != '2') && (r.status != '3') && (r.status != '6') && (r.status != '101') && (r.status != '103') || (r.is_old != '0')) && (result = false)
      })
      return result
    }
    $scope.canApplyPromoteAPI = (array) => {
      if (!array || !array.length || !array[0]) {
        return false
      }
      let result = true
      array.forEach((r, i) => {
        ((r.status != '2') && (r.status != '6') && (r.status != '103') || (r.is_old != '0')) && (result = false)
      })
      return result
    }
    $scope.canApplyUpdateAPI = (array) => {
      if (!array || !array.length || !array[0]) {
        return false
      }
      let result = true
      array.forEach((r, i) => {
        ((r.status != '4') || (r.is_old != '0')) && (result = false)
        // 105 拒绝修改状态已被废弃，((r.status != "4") && (r.status != "105") && (r.is_old != "0")) && (result = false);
      })
      return result
    }
    $scope.canRecallAPI = (array) => {
      if (!array || !array.length || !array[0]) {
        return false
      }
      let result = true
      array.forEach((r, i) => {
        ((r.status != '6') && (r.status != '106') || (r.is_old != '0')) && (result = false)
      })
      return result
    }
    $scope.canRestoreAPI = (array) => {
      if (!array || !array.length || !array[0]) {
        return false
      }
      let result = true
      array.forEach((r, i) => {
        ((r.status != '107') || (r.is_old != '0')) && (result = false)
      })
      return result
    }
    $scope.canDumpAPI = (array) => {
      if (!array || !array.length || !array[0]) {
        return false
      }
      let result = true
      array.forEach((r, i) => {
        ((r.status != '4') || (r.is_old != '0')) && (result = false)
      })
      return result
    }
    $scope.checkedRows = () => {
      let data = $scope.tableData
      if (!data || !data.length || !data[0]) {
        return []
      }
      let filtered = [].concat.apply([], data.map((r, i) => {
        return (r._checked) ? [r] : []
      }))
      return filtered
    }
    $scope.deleteAPI = (row) => {
      return $rootScope.confirm('请确认是否要删除API？', () => {
        return $scope.ajax('delete_api', {api_id: row.api_id}, (data) => {
          $scope.research()
          $rootScope.warn('删除成功', 1)
        })
      })
    }
    $scope.applyAPI = (row, status) => {
      if (status == '5') {
        return $rootScope.confirm(`数据为<${row.status_name}>状态，确定要申请修改吗？`, () => {
          return $scope.ajax('apply_api', {api_id: row.api_id, status: status}, (data) => {
            //$scope.research();
            $scope.searcher()
            $rootScope.warn('申请成功', 1)
            return data
          })
        })
      } else {
        return $scope.ajax('apply_api', {api_id: row.api_id, status: status}, (data) => {
          $scope.searcher()
          $rootScope.warn('申请成功', 1)
          return data
        })
      }
    }
    $scope.recallAPI = (row) => {
      return $scope.ajax('cancel_api', {api_id: row.api_id}, (data) => {
        $scope.searcher()
        //$rootScope.alert("撤销成功");
        $rootScope.warn('撤销成功', 1)
      })
    }
    $scope.restoreAPI = (row) => {
      return $scope.ajax('recover_api', {api_id: row.api_id}, (data) => {
        $scope.searcher()
        //$rootScope.alert("恢复成功");
        $rootScope.warn('恢复成功', 1)
      })
    }
    $scope.dumpAPI = (row) => {
      return $rootScope.confirm('请确认是否要废弃API？', () => {
        return $scope.ajax('dump_api', {api_id: row.api_id}, (data) => {
          $scope.searcher()
          //$rootScope.alert("废弃成功");
          $rootScope.warn('废弃成功', 1)
        })
      })
    }
    $scope.batchSaveAPI = (apply_type) => {
      let rows = $scope.checkedRows(), status = rows.map((r, i) => {return r.status_name}),
        uniqueStatus = [...new Set(status)], statusString = uniqueStatus.join('/'),
        operationString = (apply_type == '2') ? '批量上线' : ((apply_type == '3') ? '批量申请修改' : ((apply_type == '4') ? '批量撤销' : '批量操作'))
      return $rootScope.confirm(`数据为<${statusString}>状态,您确定要进行<${operationString}>吗？`, () => {
        let apiIDs = rows.map((r, i) => {return {api_id: r.api_id}})
        return $scope.ajax('batch_save', {apply_type: apply_type, api_list: apiIDs}, (data) => {
          $scope.research()
          //$rootScope.alert(`${operationString}成功`);
          $rootScope.warn(`${operationString}成功`, 1)
        })
      })
    }

    let ReminderController = (scope, api, user_list, unique_id) => {
      scope.original_user_list = user_list
      scope.user_list = user_list
      scope.columns = [{
        text: '开发者名称',
        name: 'user_name',
        style: {'text-align': 'center', 'width': '328px'}
      }]
      scope.multiple = true
      scope.dialogId = unique_id
      scope.filter = () => {
        let candidateList = [].concat.apply([], scope.user_list.map((r, i) => {
          if (scope.keyword && (r.user_name.indexOf(scope.keyword) != -1)) {
            r._highlight = true
            return [i]
          } else {
            r._highlight = false
            return []
          }
        })), index = candidateList[0]//, $el = angular.element(`#${scope.dialogId} .scroller`);
        //el.scrollTop = 40*index;
        //$el.animate({scrollTop: 40*index});
        scope.index = index
      }

      scope.filterNext = (e) => {
        e.preventDefault()
        e.stopPropagation()
        let candidateList = [].concat.apply([], scope.user_list.map((r, i) => {
          if (r.user_name.indexOf(scope.keyword) != -1) {
            return [i]
          } else {
            return []
          }
        })), index = candidateList[0]//, $el = angular.element(`#${scope.dialogId} .scroller`);
        for (var i = 0; i < candidateList.length; i++) {
          if (candidateList[i] > scope.index) {
            index = candidateList[i]
            break
          }
        }
        //el.scrollTop = 40*index;
        //$el.animate({scrollTop: 40*index});
        scope.index = index
        //window.browserSearch(el,scope.keyword);
      }
      scope.send = () => {
        if (scope.refreshing) {return}
        let list = [].concat.apply([], scope.user_list.map((r, i) => {return r._checked ? [{user_id: r.user_id}] : []}))
        if (!list.length) {
          scope.error = '请选择至少一位开发者进行变更提醒'
          return
        }
        scope.refreshing = true
        return $http.post('/agent', {
          module: 'application',
          partial: 'api',
          api: 'reminder_send',
          param: {
            api_id: api.api_id,
            user_list: list
          }
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            scope.closeReminder()
            return body.data
          } else {
            scope.error = body.data.msg
            return $q.reject(body.data.msg)
          }
        }, why => {
          scope.error = why
          return $q.reject(why)
        }).finally(() => {scope.refreshing = false})
      }
      scope.closeReminder = () => {
        $mdDialog.hide()
      }

      /*$rootScope.nextTick(()=>{
       scope.$watch(()=>{
       return angular.element(`#${scope.dialogId} .scroller`);
       },()=>{

       })
       });*/
    }

    $scope.reminder = (ev, api) => {
      if ($scope.refreshing) {return}
      $scope.refreshing = true
      return $scope.ajax('reminder_developers', {
        api_id: api.api_id
      }, (data) => {
        if (data.user_list && data.user_list.length) {
          $mdDialog.show({
            controller: ReminderController,
            template: `
                                <md-dialog aria-label="用户提醒" class="reminder" aria-describedby="reminder" id="{{dialogId}}">
                                    <md-toolbar>
                                        <div class="md-toolbar-tools">
                                            <h3><span>变更提醒</span></h3>
                                            <md-icon class="" md-svg-icon="action:ic_info_24px">
                                                <md-tooltip md-direction="down">当API信息发生变更时，供应商可以手动选择需要被提醒的相关开发者，发送提醒邮件</md-tooltip>
                                            </md-icon>
                                            <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="closeReminder()">
                                                <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                                            </md-button>
                                        </div>
                                    </md-toolbar>

                                    <md-dialog-content>
                                        <div class="md-dialog-content" >
                                            <form class="search-wrapper" ng-submit="filterNext($event)">
                                                <div class="search-group">
                                                    <button type="submit">
                                                        <md-icon class="md-primary" md-svg-icon="action:ic_search_24px" ng-click="filterNext($vent)"></md-icon>
                                                    </button>
                                                    <input type="text" class="searcher" ng-model="keyword" placeholder="请输入关键字......" ng-change="filter()"/>
                                                </div>
                                            </form>
                                            <div class="table-wrapper">
                                                <rop-fixed-table cols="columns" data="user_list" cursor="index" keyword="keyword" multiple="multiple"/>
                                                <div class="app-loading" ng-if="refreshing">
                                                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                                                </div>
                                            </div>
                                        </div>
                                    </md-dialog-content>

                                    <md-dialog-actions layout="row">
                                        <div class="message" ng-if="error">
                                            <span ng-bind="error"></span>
                                        </div>
                                      <md-button ng-click="send()">发送</md-button>
                                    </md-dialog-actions>
                                </md-dialog>
                            `,
            autoWrap: false,
            targetEvent: ev,
            clickOutsideToClose: true,
            parent: angular.element(document.querySelector('body>section>md-content')),
            locals: {api: api, user_list: data.user_list, unique_id: new Date().getTime()}
          })
        } else {
          $rootScope.alert('当前API尚未有任何开发者使用，无需变更提醒')
        }
      }).finally(() => {$scope.refreshing = false})
    }
    let ApiAddrController = (scope, api) => {
      scope.api = api
      scope.save = () => {
        console.log(scope.api)
        if (scope.refreshing) {return}
        if (scope.updateApiAddr.$invalid) {
          scope.updateApiAddr.$error.required && scope.updateApiAddr.$error.required.forEach(r => { r.$setDirty(true) })
          scope.updateApiAddr.$error.validUnicodeLength && scope.updateApiAddr.$error.validUnicodeLength.forEach(r => { r.$setDirty(true) })
          scope.updateApiAddr.$error.maxlength && scope.updateApiAddr.$error.maxlength.forEach(r => { r.$setDirty(true) })
          scope.error = '请检查输入是否正确'
          return
        }
        scope.refreshing = true
        $http.post('/agent', {
          module: 'application',
          partial: 'api',
          api: 'api_url_save',
          param: scope.api
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            $mdDialog.hide()
          } else {
            scope.error = body.data.msg
            return $q.reject(body.data.msg)
          }
        }, why => {
          scope.error = why
          return $q.reject(why)
        }).finally(() => {scope.refreshing = false})
      }
      scope.close = () => {
        $mdDialog.hide()
      }
    }
    $scope.updateApiAddr = (ev, api) => {
      if ($scope.refreshing) {return}
      $scope.refreshing = true
      let myApi = {
        api_id: api.api_id
      }
      $rootScope.ajax('api_url_get', {
        api_id: myApi.api_id
      }).then(data => {
        if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
          myApi.online_url = data.api_url.online_url
          myApi.test_url = data.api_url.test_url
          $mdDialog.show({
            controller: ApiAddrController,
            template: `
            <md-dialog aria-label="API地址修改" class="form" aria-describedby="quick edit">
                <md-toolbar>
                    <div class="md-toolbar-tools">
                        <md-icon md-svg-icon="navigation:ic_apps_24px"></md-icon>
                        <h3><span>API地址修改</span></h3>
                        <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                            <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                        </md-button>
                    </div>
                </md-toolbar>

                <md-dialog-content>
                    <form class="md-dialog-content" name="updateApiAddr" ng-submit="save()" autocomplete="off">
                        <div class="input-container" style="border: 1px solid #d4d8df; border-radius: 3px;">
                              <label style="width: 88px;height: 40px; line-height: 40px; text-align: center; border-right: 1px solid #d4d8df; background-color: #f2f2f2">正式环境</label>
                              <input type="text" name="group_name" placeholder="请填写正式环境URL地址" ng-model="api.online_url" required ng-disabled="refreshing" style="border: none"/>
                        </div>
                        <div class="input-container" style="border: 1px solid #d4d8df; border-radius: 3px;">
                              <label style="width: 88px;height: 40px; line-height: 40px; text-align: center; border-right: 1px solid #d4d8df; background-color: #f2f2f2">沙箱环境</label>
                              <input type="text" name="group_name" placeholder="请填写测试环境URL地址" ng-model="api.test_url" required ng-disabled="refreshing" style="border: none" />
                        </div>
                        <div class="hint" aria-hidden="false" style="font-size: 12px; margin: 30px 0 10px;
                        line-height: 14px;height: 28px;
                        transition: all .3s cubic-bezier(0.55,0,0.55,0.2);
                        color: rgba(0,0,0,0.38);">请输入供应商REST测试、正式API 的URL<br>
          如果供应商部署在阿里云ECS，优先使用ECS服务器内网IP<br>
          地址修改后API状态不发生变更，SDK无需重新生成
                    </div>
                    </form>
                    <div class="app-loading" ng-if="refreshing">
                        <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                    </div>
                </md-dialog-content>

                <md-dialog-actions layout="row">
                    <div class="message" ng-if="error">
                        <span ng-bind="error"></span>
                    </div>
                    <md-button ng-click="save()" type="submit" ng-disabled="refreshing">保存</md-button>
                </md-dialog-actions>
            </md-dialog> `,
            autoWrap: false,
            targetEvent: ev,
            clickOutsideToClose: true,
            parent: angular.element(document.querySelector('body>section>md-content')),
            locals: {api: myApi}
          })
        }
      }).finally(()=>{$scope.refreshing = false})
    }
    let CheckParamCtrl = (scope, api) => {
      scope.api = api
      scope.save = () => {
        if (scope.refreshing) {return}
        scope.refreshing = true
        $http.post('/agent', {
          module: 'application',
          partial: 'api',
          api: 'api_check_param_save',
          param: scope.api
        }).then(body => {
          if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
            $mdDialog.hide()
          } else {
            scope.error = body.data.msg
            return $q.reject(body.data.msg)
          }
        }, why => {
          scope.error = why
          return $q.reject(why)
        }).finally(() => {scope.refreshing = false})
      }
      scope.close = () => {
        $mdDialog.hide()
      }
    }
    $scope.checkParam = (ev, api) => {
      if ($scope.refreshing) {return}
      $scope.refreshing = true
      let myApi = {
        api_id: api.api_id
      }
      $rootScope.ajax('api_check_param_get', {
        api_id: myApi.api_id
      }).then(data => {
        if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            myApi.param_check = data.param_check
            $mdDialog.show({
              controller: CheckParamCtrl,
              template: `
              <md-dialog aria-label="参数校验" class="form" aria-describedby="quick edit">
                  <md-toolbar>
                      <div class="md-toolbar-tools">
                          <md-icon md-svg-icon="navigation:ic_apps_24px"></md-icon>
                          <h3><span>参数校验</span></h3>
                          <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                              <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                          </md-button>
                      </div>
                  </md-toolbar>

                  <md-dialog-content>
                      <form class="md-dialog-content" name="catGroupForm" ng-submit="save()" autocomplete="off">
                          <div class="input-container" style="border: 1px solid #d4d8df; border-radius: 3px;">
                              <label style="width: 88px;height: 40px; line-height: 40px; text-align: center; border-right: 1px solid #d4d8df; background-color: #f2f2f2">参数校验</label>
                              <md-checkbox ng-model="api.param_check" aria-label="Checkbox 1" class="md-primary" ng-true-value="'1'" ng-false-value="'0'" >请求参数校验</md-checkbox>
                          </div>
                          <div class="hint" aria-hidden="false" style="font-size: 12px; margin: 30px 0 10px;
                        line-height: 14px;height: 28px;
                        transition: all .3s cubic-bezier(0.55,0,0.55,0.2);
                        color: rgba(0,0,0,0.38);">当开启“请求参数校验”时，请求参数选择为“必须”时，平台会保证此参数必须存在。<a href="http://open.rongcapital.cn/welcome/document/81a5981f-34e4-4b61-aa79-88ea53aabfc8" target="_blank" style="color: #00a589;">详细信息</a></div>
                      </form>
                      <div class="app-loading" ng-if="refreshing">
                          <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                      </div>
                  </md-dialog-content>

                  <md-dialog-actions layout="row">
                      <div class="message" ng-if="error">
                          <span ng-bind="error"></span>
                      </div>
                      <md-button ng-click="save()" type="submit" ng-disabled="refreshing">保存</md-button>
                  </md-dialog-actions>
              </md-dialog> `,
              autoWrap: false,
              targetEvent: ev,
              clickOutsideToClose: true,
              parent: angular.element(document.querySelector('body>section>md-content')),
              locals: {api: myApi}
            })
          }
      }).finally(() => {$scope.refreshing = false})
    }
    /*$scope.previewAPI = ()=> {
     $rootScope.openPopup(`api/ApiPreview-${$scope.tableData._select.api_id}.html`, "_blank")
     }*/

    // 模式1，修改，添加API的功能数据
    let initialUpdaterAPI = {
        api_name: '',
        api_rank: ($rootScope.profile.login_user_rank == "0")?'0':'1',
        timeout: '30',
        is_noserver: '0',
        api_title: '',
        api_title_en: '',
        api_desc: '',
        api_desc_en: '',
        return_example_xml: '',
        return_example_json: '',
        test_url: '',
        online_url: '',
        busparam: [{is_must: '0'}, {is_must: '0'}, {is_must: '0'}, {is_must: '0'}, {is_must: '0'}],
        buserror: [{}, {}, {}, {}, {}],
        result: [{}, {}, {}, {}, {}]
      }, initialSteps = [{name: '基本信息'}, {name: '请求参数'}, {name: '返回结果'}, {name: '错误代码'}],
      initialClientSteps = [{name: '基本信息'}, {name: '错误代码'}], initAPIQ
    $scope.lowerCharcodes = [190, ...[...Array(26).keys()].map(r => {return r + 65})]
    $scope.updaterAPI = JSON.parse(JSON.stringify(initialUpdaterAPI))
    $scope.step = 0
    $scope.steps = initialSteps
    //$scope.step1 = 0;
    //$scope.steps1 = [{name:"基本信息"},{name:"错误代码"}];
    $scope.updaterSelection = {panelCat: initCat, panelCatGroup: initGroup}
    $scope.step1Tab = 0
    $scope.selectStep1Tab = (value) => {
      $scope.step1Tab = value
    }
    $scope.initAPI = (row) => {
      return $scope.ajax('api_init', {}, (data) => {
        $scope.apiInit = data
        $scope.apiInit && $scope.apiInit.environment.length && $scope.apiInit.environment.forEach(r => {!r.url && (r.url = '')})
        initialUpdaterAPI.environment_url = $scope.apiInit.environment
        $scope.updaterAPI.environment_url = JSON.parse(JSON.stringify($scope.apiInit.environment))
        if ($scope.apiInit && $scope.apiInit.cat_list && $scope.apiInit.cat_list[0]) {
          initCat = $scope.apiInit.cat_list[0]
          if ($scope.apiInit.cat_list[0].group_list && $scope.apiInit.cat_list[0].group_list[0]) {
            initGroup = $scope.apiInit.cat_list[0].group_list[0]
          }
        } else {
          return $q.reject('该账号暂无任何可操作的API分类，请完成审核流程并添加API分类')
        }
      })
    }
    initAPIQ = $scope.initAPI()
    $scope.addAPIMode = (mode) => {
      $scope.step1Tab = 0
      initAPIQ && initAPIQ.then(data => {
        $scope.mode = mode
        //$scope.updaterAPI = initialUpdaterAPI;
        $scope.updaterSelection.panelCat = initCat
        $scope.updaterSelection.panelCatGroup = initGroup
        $scope.updaterSelection.callMode = callMode[($rootScope.profile.login_user_level == '2') ? '2' : '0'];
        ($scope.step != 0) && ($scope.step = 0)
        if (mode == 1) {
          $scope.steps = initialSteps
          $scope.updaterAPI.call_flag = '0'
        } else {
          $scope.steps = initialClientSteps
          $scope.updaterAPI.call_flag = '1'
        }
        $scope.ajax('api_datatype', {cat_id: $scope.updaterSelection.panelCat.cat_id}, (data) => {
          $scope.resultDataTypes = data.data_type_list
        })
      }, e => {$rootScope.alert(e)})
    }
    $scope.updateAPIMode = (forView) => {
      $scope.step1Tab = 0
      $scope.updaterAPI.api_id = 'fake'
      return initAPIQ && initAPIQ.then(data => {
          if (!$scope.apiInit || !$scope.apiInit.cat_list) {
            $rootScope.alert('API没有分类信息')
            return
          }
          return $scope.ajax('api_info', {api_id: $scope.tableData._select.api_id}, (data) => {
            if (data.api_info.call_flag == '0') {
              $scope.mode = 1
              $scope.steps = initialSteps
            } else {
              $scope.mode = 4
              $scope.steps = initialClientSteps
            }
            ($scope.step != 0) && ($scope.step = 0)
            $scope.originalUpdaterAPI = JSON.parse(JSON.stringify(data.api_info))
            angular.extend($scope.updaterAPI, data.api_info)
            forView && ($scope.updaterAPI._forView = forView)
            $scope.updaterSelection.panelCat = [].concat.apply([], $scope.apiInit.cat_list.map(r => {
              return (r.cat_id == $scope.updaterAPI.cat_id) ? [r] : []
            }))[0]
            !$scope.updaterSelection.panelCat && ($scope.updaterSelection.panelCat = initCat)
            if ($scope.updaterSelection.panelCat.group_list && $scope.updaterSelection.panelCat.group_list[0]) {
              $scope.updaterSelection.panelCatGroup = [].concat.apply([], $scope.updaterSelection.panelCat.group_list.map(r => {
                return (r.group_id == $scope.updaterAPI.group_id) ? [r] : []
              }))[0]
            }
            (!$scope.updaterSelection.panelCatGroup || !$scope.updaterSelection.panelCatGroup.group_id) && ($scope.updaterSelection.panelCatGroup = initGroup)
            $scope.updaterSelection.callMode = callMode[$scope.updaterAPI && ($scope.updaterAPI.call_mode == '2') ? '0' : '2']
            $scope.ajax('api_datatype', {cat_id: $scope.updaterSelection.panelCat.cat_id}, (data) => {
              $scope.resultDataTypes = data.data_type_list
            })
          })
        })
    }
    //$scope.toggleMdCheck = (obj, prop)=>{obj[prop] = (obj[prop] === undefined)?undefined:((obj[prop] == "0")?"1":"0");}
    $scope.nextStep = () => {
      if ($scope.updaterAPI._forView) {
        ($scope.step < 3) && $scope.step++
        return
      }
      if ($scope.mode == 1) {
        // 需求，只有用户点过一次下一步按钮后再显示错误
        !$scope.nextKeyPressed && ($scope.nextKeyPressed = true)
        if ($scope.updaterAPIForm.$invalid) {
          for (let pattern in $scope.updaterAPIForm.$error) {
            $scope.updaterAPIForm.$error[pattern].forEach(r => {r.$setDirty(true)})
          }
          return
        }
        ($scope.step < 3) && $scope.step++
      } else if ($scope.mode == 4) {
        !$scope.frontEndNextKeyPressed && ($scope.frontEndNextKeyPressed = true)
        if ($scope.updaterFrontEndAPIForm.$invalid) {
          //$scope.updaterFrontEndAPIForm.$error.required && $scope.updaterFrontEndAPIForm.$error.required.forEach(r => {r.$setDirty(true);});
          for (let pattern in $scope.updaterFrontEndAPIForm.$error) {
            $scope.updaterFrontEndAPIForm.$error[pattern].forEach(r => {r.$setDirty(true)})
          }
          return
        }
        ($scope.step < 3) && $scope.step++
      }
    }
    $scope.previousStep = () => {($scope.step > 0) && $scope.step--}
    $scope.cancelStep = () => {
      $scope.updaterAPI = JSON.parse(JSON.stringify(initialUpdaterAPI))
      if ($scope.mode == 1) {
        $scope.nextKeyPressed = false
        $scope.updaterAPIForm.$setPristine()
      } else if ($scope.mode == 4) {
        $scope.frontEndNextKeyPressed = false
        $scope.updaterFrontEndAPIForm.$setPristine()
      }
      $scope.mode = 0
      $scope.step = 0
      $scope.step1Tab = 0
      $scope.quickURL = ""
      $scope.updaterSelection = {panelCat: initCat, panelCatGroup: initGroup}
    }
    $scope.chooseUpdaterCat = (cat, group) => {
      $rootScope.confirm('修改API类别会导致 [结构属性信息] 类型中含有结构属性的数据清空，确定修改API类别吗', () => {
        $scope.updaterSelection.panelCat = cat || initCat
        $scope.updaterAPI.cat_id = $scope.updaterSelection.panelCat.cat_id
        if ($scope.updaterSelection.panelCat.group_list && $scope.updaterSelection.panelCat.group_list[0]) {
          $scope.updaterSelection.panelCatGroup = $scope.updaterSelection.panelCat.group_list[0]
        } else {
          $scope.updaterSelection.panelCatGroup = initGroup
        }
        $scope.ajax('api_datatype', {cat_id: $scope.updaterSelection.panelCat.cat_id}, (data) => {
          $scope.resultDataTypes = data.data_type_list
        })
      })
    }
    $scope.chooseUpdaterGroup = (group) => {
      $scope.updaterSelection.panelCatGroup = group || initGroup
      $scope.updaterAPI.group_id = $scope.updaterSelection.panelCatGroup.group_id
    }
    $scope.processResultDataType = (data_type, result) => {
      let systemDataTypes = $scope.apiInit.data_type_list.map(r => {
        return r.data_type
      })
      result._customized = (systemDataTypes.indexOf(data_type) == -1);
      (data_type != result.param_type) && (result.param_type = data_type)
      if (result._customized) {
        let param_name
        if (result.is_list == '1') {
          param_name = result.param_type ? `${result.param_type.toLowerCase()}s` : ''
          let second_param_name = result.param_type ? result.param_type.toLowerCase() : '';
          (result.second_node != second_param_name) && (result.second_node = second_param_name)
        } else {
          param_name = result.param_type ? result.param_type.toLowerCase() : '';
          (result.second_node != '') && (result.second_node = '')
        }
        (result.param_name != param_name) && (result.param_name = param_name);
        (result.first_node != param_name) && (result.first_node = param_name)
      } else {
        result.is_list = '0'
        result.first_node = ''
        result.second_node = ''
      }
    }
    $scope.processListCheck = (result) => {
      if (!result._customized) {
        return
      }
      $rootScope.nextTick(() => {
        let param_name
        if (result.is_list == '1') {
          param_name = result.param_type ? `${result.param_type.toLowerCase()}s` : ''
          let second_param_name = result.param_type ? result.param_type.toLowerCase() : '';
          (result.second_node != second_param_name) && (result.second_node = second_param_name)
        } else {
          param_name = result.param_type ? result.param_type.toLowerCase() : '';
          (result.second_node != '') && (result.second_node = '')
        }
        (result.param_name != param_name) && (result.param_name = param_name);
        (result.first_node != param_name) && (result.first_node = param_name)
      })
    }
    $scope.saveAPI = () => {
      if (!$scope.updaterAPI) {
        $scope.alert('没有初始化数据')
        return
      }
      let frontEndMode = ($scope.mode == 4), normalMode = ($scope.mode == 1)
      if (normalMode) {
        if ($scope.updaterAPIForm.$invalid) {
          $scope.updaterAPIForm.$error.required && $scope.updaterAPIForm.$error.required.forEach(r => {r.$setDirty(true)})
          return
        }
      } else if (frontEndMode) {
        if ($scope.updaterFrontEndAPIForm.$invalid) {
          $scope.updaterFrontEndAPIForm.$error.required && $scope.updaterFrontEndAPIForm.$error.required.forEach(r => {r.$setDirty(true)})
          return
        }
      }
      let api = {
        cat_id: $scope.updaterSelection.panelCat.cat_id,
        group_id: $scope.updaterSelection.panelCatGroup.group_id,
        api_id: $scope.updaterAPI.api_id,
        call_flag: $scope.updaterAPI.call_flag,
        api_name: $scope.updaterAPI.api_name,
        api_title: $scope.updaterAPI.api_title,
        api_code: $scope.updaterAPI.api_code,
        api_title_en: $scope.updaterAPI.api_title_en,
        api_desc: $scope.updaterAPI.api_desc,
        api_desc_en: $scope.updaterAPI.api_desc_en,
        return_example_xml: $scope.updaterAPI.return_example_xml,
        return_example_json: $scope.updaterAPI.return_example_json,
        test_url: $scope.updaterAPI.test_url,
        online_url: $scope.updaterAPI.online_url,
        timeout: $scope.updaterAPI.timeout,
        api_rank: $scope.updaterAPI.api_rank,
        is_noserver: $scope.updaterAPI.is_noserver,
        param_check: $scope.updaterAPI.param_check,
        business_param: [].concat.apply([], $scope.updaterAPI.busparam.map(r => {return r.param_name ? [r] : []})),
        return_result: [].concat.apply([], $scope.updaterAPI.result.map(r => {return r.param_name ? [r] : []})),
        business_error: [].concat.apply([], $scope.updaterAPI.buserror.map(r => {return r.error_code ? [r] : []})),
        environment_url: !$scope.updaterAPI.api_id ? $scope.updaterAPI.environment_url : undefined,
        call_mode: $scope.updaterSelection && $scope.updaterSelection.callMode.id || ''
      }
      if (!api.call_flag || !api.cat_id || !api.api_title || !api.api_title_en || !api.api_desc || !api.api_desc_en || !api.return_example_xml || !api.return_example_json || !api.test_url || !api.online_url || !api.timeout || !api.api_rank || !api.is_noserver || (api.environment_url && api.environment_url.length ? ![].concat.apply([], api.environment_url.map(r => {
          return r.url ? [r] : []
        })).length : 0)) {
        $scope.alert('基本信息不能为空')
        return
      }
      if (api.call_flag && (api.call_flag == '0') && (!api.return_result || !api.return_result.length)) {
        $scope.alert('全栈模式必须有返回结果')
        return
      }
      return $rootScope.confirm('系统将保存API设置，您确认要保存吗？', () => {
        if ($scope.refreshing) {return}
        $scope.refreshing = true
        return $scope.ajax('api_save', api).then((data) => {
          $scope.refreshing = false
          $scope.resetOrder()
          $scope.resetAuditFree()
          $scope.exitMode()
          $scope.step = 0
          $scope.nextKeyPressed = false
          $scope.frontEndNextKeyPressed = false
          $scope.updaterAPI.api_id ? $scope.searcher() : $scope.research()
          if (normalMode) {
            $scope.updaterAPIForm.$setPristine()
          } else if (frontEndMode) {
            $scope.updaterFrontEndAPIForm.$setPristine()
          }
          $scope.updaterAPI = JSON.parse(JSON.stringify(initialUpdaterAPI))
          $scope.quickURL = ""
        }, why => {$scope.refreshing = false})
      })
    }
    $scope.checkBasicError = () => {
      if ($scope.mode == 1) {
        return ($scope.updaterAPIForm.api_name.$invalid || $scope.updaterAPIForm.timeout.$invalid || $scope.updaterAPIForm.api_title.$invalid || $scope.updaterAPIForm.api_title_en.$invalid || $scope.updaterAPIForm.api_desc.$invalid || $scope.updaterAPIForm.api_desc_en.$invalid || $scope.updaterAPIForm.return_example_xml.$invalid || $scope.updaterAPIForm.return_example_json.$invalid || $scope.updaterAPIForm.test_url.$invalid || $scope.updaterAPIForm.online_url.$invalid)
      } else if ($scope.mode == 4) {
        return ($scope.updaterFrontEndAPIForm.api_name.$invalid || $scope.updaterFrontEndAPIForm.timeout.$invalid || $scope.updaterFrontEndAPIForm.api_title.$invalid || $scope.updaterFrontEndAPIForm.api_title_en.$invalid || $scope.updaterFrontEndAPIForm.api_desc.$invalid || $scope.updaterFrontEndAPIForm.api_desc_en.$invalid || $scope.updaterFrontEndAPIForm.return_example_xml.$invalid || $scope.updaterFrontEndAPIForm.return_example_json.$invalid || $scope.updaterFrontEndAPIForm.test_url.$invalid || $scope.updaterFrontEndAPIForm.online_url.$invalid)
      }
      return false
    }
    $scope.checkEnvironmentError = () => {
      if ($scope.mode == 1) {
        let envs = []
        if ($scope.updaterAPI && $scope.updaterAPI.environment_url && $scope.updaterAPI.environment_url.length) {
          envs = [].concat.apply([], $scope.updaterAPI.environment_url.map((r, i) => {return $scope.updaterAPIForm[`envurl${i}`].$invalid ? [r] : []}))
        }
        return (envs.length > 0)
      } else if ($scope.mode == 4) {
        let envs = []
        if ($scope.updaterAPI && $scope.updaterAPI.environment_url && $scope.updaterAPI.environment_url.length) {
          envs = [].concat.apply([], $scope.updaterAPI.environment_url.map((r, i) => {return $scope.updaterFrontEndAPIForm[`envurl${i}`].$invalid ? [r] : []}))
        }
        return (envs.length > 0)
      }
      return false
    }

    // 模式2，API排序的功能数据
    $scope.orderSelection = {}
    $scope.orderSelection.panelCat = initCat
    $scope.orderSelection.panelCatGroup = initGroup
    $scope.chooseOrderCat = (cat, group) => {
      $scope.orderSelection.panelCat = cat || {}
      $scope.orderSelection.panelCatGroup = group || {}
      $scope.sortList()
    }
    $scope.sortList = () => {
      return $scope.ajax('sort_list', {
        cat_id: $scope.orderSelection.panelCat.cat_id,
        group_id: $scope.orderSelection.panelCatGroup.group_id
      }, (data) => {
        $scope.originalSortData = JSON.parse(JSON.stringify(data))
        $scope.sortData = data
        //$scope.sortData.api_list.forEach((r)=>{r.drag = true})
        //$scope.sortData.api_list.splice(16)
      })
    }
    // TODO 业务逻辑需要，批量操作的api_id需要做成@连接的一个字符串
    $scope.sortSave = () => {
      if (!$scope.sortData || !$scope.sortData.api_list) {
        $scope.alert('没有可选排序项')
      }
      let apiIDs = $scope.sortData.api_list.map((r) => {
        return {api_id: r.api_id}
      })
      if($scope.refreshing){
        return $q.reject()
      }
      $scope.refreshing = true
      return $scope.ajax('sort_save', {api_list: apiIDs}, (data) => {
        $scope.searcher().then(() => {
          $rootScope.nextTick(() => {
            $scope.exitMode()
          })
        }).finally(()=>{
          $scope.refreshing = false
        })
      })
    }
    $scope.resetOrder = () => {
      return initAPIQ && initAPIQ.then((data) => {
          $scope.orderSelection.panelCat = initCat
          $scope.orderSelection.panelCatGroup = initGroup
          if ($scope.orderSelection.panelCat && $scope.orderSelection.panelCat.cat_id) {
            $scope.sortList()
          }
          return data
        })
    }
    $scope.resetOrder()
    $scope.exitOrder = () => {
      $scope.mode = 0
      $scope.resetOrder()
    }

    // 模式3，API免审核的功能数据
    $scope.auditFreeSelection = {}
    $scope.auditFreeSelection.panelCat = initCat
    $scope.auditFreeSelection.panelCatGroup = initGroup
    $scope.noAuditTableData = []
    let auditFreeListQ = $rootScope.defer().promise
    $scope.noAuditResearch = () => {
      $scope.noAuditPageIndex = 1
      $scope.noAuditPageSize = new Number(10)
    }
    $scope.auditFreeListAPI = () => {
      return $scope.ajax('noaudit_list', {
        cat_id: $scope.auditFreeSelection.panelCat.cat_id,
        group_id: $scope.auditFreeSelection.panelCatGroup.group_id
      }, (data) => {
        return data
      })
    }
    $scope.chooseAuditFreeCat = (cat, group) => {
      $scope.auditFreeSelection.panelCat = cat || {cat_id: '', cat_name: '全部分类'}
      if (auditFreeListQ.$$state.status == 0) {
        auditFreeListQ = $scope.auditFreeListAPI().then((data) => {
          if (data) {
            $scope.noAuditData = data.data_list.map(r => {
              r._checked = (r.apply_flag == '1')
              return r
            })
            $scope.noAuditTotal = data.data_list.length
            return data.data_list
          }
          return data
        })
        auditFreeListQ.then($scope.noAuditResearch)
        return
      }
      $scope.auditFreeListAPI().then((data) => {
        if (data) {
          $scope.noAuditData = data.data_list.map(r => {
            r._checked = (r.apply_flag == '1')
            return r
          })
          $scope.noAuditTotal = data.data_list.length
          $scope.noAuditResearch()
        }
        return data
      })
    }

    $scope.resetAuditFree = () => {
      $scope.noAuditColumns = [{text: 'API名称', name: 'api_name', tooltip: true}, {
        text: 'API分类',
        name: 'cat_name'
      }, {text: 'API描述', name: 'api_title'}]
      $scope.noAuditBatch = true
      $scope.auditFreeSelection.panelCat = {cat_id: '', cat_name: '全部分类'}
      //$scope.auditFreeSelection.panelCatGroup = initGroup;
      $scope.noAuditPageIndex = 1
      $scope.chooseAuditFreeCat()
      //$scope.searcher();
    }
    $scope.resetAuditFree()
    $scope.exitAuditFree = () => {
      $scope.mode = 0
      $scope.resetAuditFree()
    }
    $scope.auditSearcher = (index, size) => {
      return auditFreeListQ.then(data => {
        if (!data) {
          return false
        }
        let list = [].concat.apply([], $scope.noAuditData.map((r, i) => {
          r._checked = (r.apply_flag == '1')
          return ((i >= (index - 1) * size) && (i < index * size)) ? [r] : []
        }))
        $scope.noAuditTableData = list
      })
    }
    $scope.auditFreeSaveAPI = () => {
      let apiIDs = [].concat.apply([], $scope.noAuditData.map(r => {
        return r._checked ? [{api_id: r.api_id}] : []
      }))
      return $scope.ajax('noaudit_save', {
        api_list: apiIDs,
        cat_id: $scope.auditFreeSelection.panelCat.cat_id
      }, (data) => {
        auditFreeListQ = $scope.auditFreeListAPI().then((data) => {
          if (data) {
            $scope.noAuditData = data.data_list.map(r => {
              r._checked = (r.apply_flag == '1')
              return r
            })
            $scope.noAuditTotal = data.data_list.length
            return data.data_list
          }
          return data
        })
        $scope.exitMode()
      })
    }

    // TODO cache
    $scope.cacheInitAPI = () => {
      return $scope.ajax('cache_init', {api_id: $scope.tableData._select.api_id}, (data) => {
        return data
      })
    }
    $scope.showCache = function (ev) {
      if (!$scope.tableData._select || !$scope.tableData._select.api_id) {
        $rootScope.alert('没有选中一条数据')
        return
      }
      let getStatus = status => {
        return (status == '0') ? '关闭' : ((status == '1') ? '已开启' : ((status == '2') ? '申请开启' : ((status == '3') ? '拒绝开启' : ((status == '') ? '无' : '未知'))))
      }
      $scope.cacheInitAPI().then(data => {
        let CacheController = (scope, $mdDialog) => {
          scope.cache_time = data.cache_time ? data.cache_time : '0'
          scope.cache_status = data.cache_status
          scope.cache_status_text = getStatus(data.cache_status)
          scope.cache_time_online = data.cache_time_online ? data.cache_time_online : '0'
          scope.cache_status_online = data.cache_status_online
          scope.cache_status_online_text = getStatus(data.cache_status_online)
          scope.cancel = function () {
            $mdDialog.hide()
          }
          scope.apply = (cache_type, cache_status) => {
            if (scope.cacheLoading) {
              return
            }
            scope.cacheLoading = true
            return $scope.ajax('cache_apply', {
              cache_type: cache_type,
              cache_status: cache_status,
              api_id: $scope.tableData._select.api_id
            }, (data) => {
              return $scope.cacheInitAPI().then(data => {
                scope.cache_time = data.cache_time ? data.cache_time : '0'
                scope.cache_status = data.cache_status
                scope.cache_status_text = getStatus(data.cache_status)
                scope.cache_time_online = data.cache_time_online ? data.cache_time_online : '0'
                scope.cache_status_online = data.cache_status_online
                scope.cache_status_online_text = getStatus(data.cache_status_online)
                return data
              })
            }).finally(() => {
              scope.cacheLoading = false
            })
          }
          scope.save = () => {
            if (scope.cacheLoading || scope.cacheForm.$invalid) {
              return
            }
            scope.cacheLoading = true
            return $scope.ajax('cache_save', {
              api_id: $scope.tableData._select.api_id,
              cache_time: scope.cache_time,
              cache_time_online: scope.cache_time_online
            }, (data) => {
              $mdDialog.hide()
            }).finally(() => {
              scope.cacheLoading = false
            })
          }
        }
        $mdDialog.show({
          controller: CacheController,
          template: `<md-dialog aria-label="Mango" class="cache-dialog">
                                <md-toolbar>
                                    <div class="md-toolbar-tools">
                                        <h3><span>设置缓存</span></h3>
                                        <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="cancel()">
                                            <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                                        </md-button>
                                    </div>
                                </md-toolbar>
                                <md-dialog-content class="md-dialog-content">
                                    <div class="md-dialog-content-head">
                                        <p class="justification">点击“启动”按钮时缓存功能将立即生效<br />点击“关闭”按钮时缓存功能将立即关闭</p>
                                        <a href="http://open.rongcapital.cn/welcome/document/0579ece4-c4a5-4bc2-ac73-489ace89d2bb" target="_blank" class="readmore">
                                            设置缓存说明
                                        </a>
                                    </div>
                                    <div class="md-dialog-content-body">
                                        <md-progress-circular md-mode="indeterminate" ng-show="cacheLoading" class="md-primary"></md-progress-circular>
                                        <form name="cacheForm" autocomplete="off">
                                            <table class="md-datatable">
                                                <thead>
                                                    <tr>
                                                        <th>沙箱环境</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>缓存状态</td>
                                                        <td>
                                                            <div class="cache-row">
                                                                <span ng-bind="cache_status_text"></span>
                                                                <md-button ng-if="(cache_status == '0') || (cache_status == '3')" ng-click="apply('0','2')" class="md-raised text line" aria-label="data control" ng-disabled="cacheLoading" ><span>启动</span></md-button>
                                                                <md-button ng-if="cache_status == '1'" ng-click="apply('0','0')" class="md-raised text line" aria-label="data control" ng-disabled="cacheLoading" ><span>关闭</span></md-button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>缓存时间</td>
                                                        <td><div class="cache-row"><input type="text" id="sandbox_cache" name="sandbox_cache" ng-model="cache_time" pattern="^([1-9]\\d{0,5}|0)$" ng-disabled="!cache_status" required/><label for="sandbox_cache">分钟</label></div></td>
                                                    </tr>
                                                </tbody>
                                                <thead>
                                                    <tr>
                                                        <th >生产环境</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>缓存状态</td>
                                                        <td>
                                                            <div class="cache-row">
                                                                <span ng-bind="cache_status_online_text"></span>
                                                                <md-button ng-if="(cache_status_online == '0') || (cache_status_online == '3')" ng-click="apply('1','2')" class="md-raised text line" aria-label="data control" ng-disabled="cacheLoading" ><span>启动</span></md-button>
                                                                <md-button ng-if="cache_status_online == '1'" ng-click="apply('1','0')" class="md-raised text line" aria-label="data control" ng-disabled="cacheLoading" ><span>关闭</span></md-button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>缓存时间</td>
                                                        <td><div class="cache-row"><input type="text" id="production_cache" name="production_cache" ng-model="cache_time_online" pattern="^([1-9]\\d{0,5}|0)$" ng-disabled="!cache_status_online" required/><label for="production_cache">分钟</label></div></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </form>
                                    </div>
                                </md-dialog-content>
                                <md-dialog-actions layout="row">
                                  <md-button ng-click="cancel()">
                                    取消
                                  </md-button>
                                  <md-button ng-click="save()" ng-disabled="cacheLoading">
                                    保存
                                  </md-button>
                                </md-dialog-actions>
                            </md-dialog>`,
          /*parent: angular.element(document.body),*/
          targetEvent: ev,
          clickOutsideToClose: true
          //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        }).then(function (answer) {
          $scope.status = 'You said the information was "' + answer + '".'
        }, function () {
          $scope.status = 'You cancelled the dialog.'
        })
      })
    }

    let modeInfo = [
      {title: 'API列表', cancelFunction: $scope.reset, desc: '您可以使用API列表模块管理供应商API，更改API状态，为API添加缓存功能等'},
      {title: 'API详情', cancelFunction: $scope.cancelStep, desc: '您可以使用API详情模块添加和修改供应商API'},
      {title: 'API排序', cancelFunction: $scope.exitOrder, desc: '您可以使用API排序模块对API进行排序'},
      {title: 'API免审核', cancelFunction: $scope.exitAuditFree, desc: '您可以使用API免审核模块管理免审核型API'},
      {title: 'API详情(前端)', cancelFunction: $scope.cancelStep, desc: '您可以使用API详情模块添加和修改供应商API'},
    ]
    $scope.getModeInfo = () => {
      if (typeof $scope.mode == 'number') {
        return modeInfo[$scope.mode]
      } else {
        return modeInfo[0]
      }
    }

    $scope.appendRow = (row, list,selector) => {
      list.push(row || {})
      if(selector){
        let $el = angular.element(selector)
        $el.animate({scrollTop: $el[0].scrollHeight})
      }
    }
    $scope.removeRow = (row, list) => {
      list.splice(list.indexOf(row), 1)
    }

    $scope.moveUp = (index, list) => {
      if (typeof index === 'number' && index > 0) {
        let item = list[index - 1]
        list[index - 1] = list[index]
        list[index] = item
      }
    }
    $scope.moveDown = (index, list) => {
      if (typeof index === 'number' && index < list.length - 1) {
        let item = list[index + 1]
        list[index + 1] = list[index]
        list[index] = item
      }
    }

    $scope.unifyEnvURL = () => {
      if ($scope.updaterAPI && $scope.updaterAPI.environment_url && $scope.updaterAPI.environment_url.length) {
        for (var i = 0; i < $scope.updaterAPI.environment_url.length; i++) {
          $scope.updaterAPI.environment_url[i].url = $scope.quickURL
        }
      }
    }
    window.test = $scope

    $scope.$watch(() => $scope.mode, mode => {
      if (mode) {
        $rootScope.globalBack = globalBack
      } else {
        $rootScope.globalBack = null
      }
    })
    let globalBack = () => {
      if (!$scope.refreshing && !$scope.cacheLoading) {
        $scope.exitMode()
      }
    }
    $scope.$on('$destroy', event => {
      $rootScope.globalBack = null
    })
  }]
})
