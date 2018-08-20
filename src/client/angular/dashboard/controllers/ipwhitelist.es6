/**
 * Created by robin on 22/11/2016.
 */
define(['../../services'], function (cta) {
    'use strict'
    return ['$rootScope', '$scope', '$q', '$location', '$http', '$timeout', '$mdDialog', 'MiscTool',
      ($rootScope, $scope, $q, $location, $http, $timeout, $mdDialog, MiscTool) => {
        $scope.columns = [
          {text: '开始IP', name: 'ip_start',style: {width: '196px', 'text-align': 'center'}},
          {text: '结束IP', name: 'ip_end',style: {width: '196px', 'text-align': 'center'}},
          {text: '备注', name: 'remark'},
          {
            text: '添加时间',
            name: 'rx_insertTime',
            formatter: str => {
              var result = ''
              try {
                result = new Date(str).Format('yyyy-MM-dd HH:mm:ss')
              } catch (e) {}
              return result
            },
            style: {width: '196px', 'text-align': 'center'}
          }
        ]
        $scope.keyword = ''
        $scope.batch = false
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
        $scope.tableData = []
        $scope.total = 0

        $scope.reset = () => {
          $scope.keyword = ''
          $scope.pageIndex = 1
          $scope.pageSize = new Number(10)
        }
        $scope.research = () => {
          $scope.pageIndex = 1
          $scope.pageSize = new Number(10)
        }
        $scope.searcher = (index, size) => {
          $scope.refreshing = true
          var previous = $scope.tableData && $scope.tableData._select
          return $scope.ajax('list', {
            pageindex: index || $scope.pageIndex,
            pagesize: size || $scope.pageSize,
            ip: $scope.keyword
          }, (data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.tableData = data.ip_list
              if ($scope.tableData && $scope.tableData[0]) {
                if (previous) {
                  $scope.tableData._select = [].concat.apply([], $scope.tableData.map(r => ((previous.id == r.id) ? [r] : [])))[0]
                } else {
                  $scope.tableData._select = $scope.tableData[0]
                }
              }
              $scope.total = data.list_count
            } else {
              $rootScope.alert(data.msg)
              $scope.total = 0
            }
          }, () => {
            $scope.total = 0
          }).finally(() => {
            $scope.refreshing = false
          })
        }
        $scope.canVisistIP = () => $scope.tableData._select

        $scope.deleteIP = () => {
          if (!$scope.tableData || !$scope.tableData._select) {
            return $q.reject()
          }
          return $rootScope.confirm('请确认是否要删除此IP？', () => {
            return $scope.ajax('delete', {id: $scope.tableData._select.id}, (data) => {
              $scope.research()
              $rootScope.warn('删除成功', 1)
            })
          })
        }

        let IPController = (scope, $mdDialog, ip) => {
          scope.range = (ip && ip.ip_end && /^([1-9]|[1-9][0-9]|[1][0-9][0-9]|2[0-4][0-9]|25[0-5]\.){3}[1-9]|[1-9][0-9]|[1][0-9][0-9]|2[0-4][0-9]|25[0-5]$/.test(ip.ip_end) && (ip.ip_start != ip.ip_end)) ? true : false

          scope.singleIP = [172, 20, 1, 1]
          scope.rangeIPEnd = [172, 20, 1, 1]

          scope.remark = ip && ip.remark || ''
          // 假如是修改
          if (ip) {
            if (ip.ip_start) {
              scope.singleIP = ip.ip_start.split('.')
            }
            if (ip.ip_end) {
              scope.rangeIPEnd = ip.ip_end.split('.')
            }
            for (var i = 0; i < scope.singleIP.length; i++) {
              // 假如是脏数据，置为0
              if ((!scope.singleIP[i]) || Number.isNaN(scope.singleIP[i])) {
                scope.singleIP[i] = 0
              } else {
                scope.singleIP[i] = Number(scope.singleIP[i])
              }
              // 假如是最后一位，且最后一位为0或空，置为1
              if ((i == 3) && (scope.singleIP[i] == 0)) {
                scope.singleIP[i] = 1
              }
            }
            // 假如是IP开始比结束要大，且IP结束不为空
            if (!ip.ip_end && ((Number(scope.singleIP.join(''))) > (Number(scope.rangeIPEnd.join(''))))) {
              scope.rangeIPEnd = scope.singleIP
            } else {
              for (var i = 0; i < scope.rangeIPEnd.length; i++) {
                if ((!scope.rangeIPEnd[i]) || Number.isNaN(scope.rangeIPEnd[i])) {
                  scope.rangeIPEnd[i] = 0
                } else {
                  scope.rangeIPEnd[i] = Number(scope.rangeIPEnd[i])
                }
              }
            }
          }
          /*let rawMessage = '设置IP白名单后，只有白名单IP范围内的IP可以调用API，请谨慎操作'
          scope.message = rawMessage*/

          scope.bigger3 = () => scope.range ? (Number(scope.rangeIPEnd[2] || '') >= Number(scope.singleIP[2] || '')) : true
          scope.bigger4 = () => scope.range ? ((Number(scope.rangeIPEnd[2] || '') > Number(scope.singleIP[2] || '')) || (Number(scope.rangeIPEnd[2] || '') == Number(scope.singleIP[2] || '')) && (Number(scope.rangeIPEnd[3] || '') >= Number(scope.singleIP[3] || ''))) : true
          scope.triggerValid3 = () => {
            scope.ipForm.ip3.$validate()
            scope.ipForm.ip4.$validate()
            scope.ipForm.ip4end && scope.ipForm.ip4end.$validate()
          }
          scope.triggerValid4 = () => {
            scope.ipForm.ip3.$validate()
            scope.ipForm.ip4.$validate()
            scope.ipForm.ip3end && scope.ipForm.ip3end.$validate()
          }
          scope.triggerValidEnd = () => {
            scope.ipForm.ip3end && scope.ipForm.ip3end.$validate()
            scope.ipForm.ip4end && scope.ipForm.ip4end.$validate()
          }
          scope.close = () => $mdDialog.hide()
          window.test1 = scope
          scope.save = () => {
            if (scope.loading || scope.ipForm.$invalid) {
              return
            }
            scope.loading = true
            return $http.post('/agent', {
              module: 'dashboard',
              partial: 'ipwhitelist',
              api: 'put',
              param: {
                id: ip ? ip.id : '',
                ip_start1: scope.singleIP[0],
                ip_end1: scope.singleIP[0],
                ip_start2: scope.singleIP[1],
                ip_end2: scope.singleIP[1],
                ip_start3: scope.singleIP[2],
                ip_end3: scope.range ? scope.rangeIPEnd[2] : scope.singleIP[2],
                ip_start4: scope.singleIP[3],
                ip_end4: scope.range ? scope.rangeIPEnd[3] : scope.singleIP[3],
                remark: scope.remark
              }
            }).then(body => {
              if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
                if (ip) {
                  scope.close().then(() => {
                    $scope.searcher()
                  })
                } else {
                  scope.close().then($scope.research)
                }
                return body.data
              } else {
                scope.error = body.data.msg
                return $q.reject(body.data.msg)
              }
            }, why => {
              scope.error = why
              return $q.reject(why)
            }).finally(() => {scope.loading = false})
          }
        }
        $scope.showIPDialog = (ev, ip) => {
          /*if (!$scope.tableData._select || !$scope.tableData._select.api_id) {
           $rootScope.alert('没有选中一条数据')
           return
           }
           let getStatus = status => {
           return (status == '0') ? '关闭' : ((status == '1') ? '已开启' : ((status == '2') ? '申请开启' : ((status == '3') ? '拒绝开启' : ((status == '') ? '无' : '未知'))))
           }
           $scope.cacheInitAPI().then(data => {
           )*/
          if ($scope.refreshing) {
            return
          }
          $mdDialog.show({
            controller: IPController,
            template: `<md-dialog aria-label="Mango" class="ip-dialog">
                          <md-toolbar>
                              <div class="md-toolbar-tools">
                                  <h3><span>添加IP</span></h3>
                              </div>
                          </md-toolbar>
                          <md-dialog-content class="md-dialog-content">
                              <div class="md-dialog-content-body">
                                  <form name="ipForm" autocomplete="off">
                                     <md-radio-group ng-model="range">
                                        <md-radio-button class="md-primary" aria-label="单选按钮" ng-value="false">单个IP</md-radio-button>
                                        <md-radio-button class="md-primary" ng-value="true">IP段</md-radio-button>
                                     </md-radio-group>
                                     
                                     <div class="input-container">
                                        <div class="input-row">
                                            <input ng-model="singleIP[0]" name="ip1" type="text" ng-required="true" autocomplete="off" pattern="^([1-9]?[0-9]|[1][0-9][0-9]|2[0-4][0-9]|25[0-5])$">
                                            <span class="sep">.</span>
                                            <input ng-model="singleIP[1]" name="ip2" type="text" ng-required="true" autocomplete="off" pattern="^([1-9]?[0-9]|[1][0-9][0-9]|2[0-4][0-9]|25[0-5])$">
                                            <span class="sep">.</span>
                                            <input ng-model="singleIP[2]" name="ip3" type="text" ng-required="true" autocomplete="off" pattern="^([1-9]?[0-9]|[1][0-9][0-9]|2[0-4][0-9]|25[0-5])$" ng-model-options="{ allowInvalid: true }" ng-change="triggerValidEnd()">
                                            <span class="sep">.</span>
                                            <input ng-model="singleIP[3]" name="ip4" type="text" ng-required="true" autocomplete="off" pattern="^([1-9]|[1-9][0-9]|[1][0-9][0-9]|2[0-4][0-9]|25[0-5])$" ng-model-options="{ allowInvalid: true }" ng-change="triggerValidEnd()">                     
                                        </div>
                                        <div class="input-row" ng-if="range">
                                            <input ng-model="singleIP[0]" name="ip1end" type="text" ng-required="true" autocomplete="off" pattern="^([1-9]?[0-9]|[1][0-9][0-9]|2[0-4][0-9]|25[0-5])$" disabled>
                                            <span class="sep">.</span>
                                            <input ng-model="singleIP[1]" name="ip2end" type="text" ng-required="true" autocomplete="off" pattern="^([1-9]?[0-9]|[1][0-9][0-9]|2[0-4][0-9]|25[0-5])$" disabled>
                                            <span class="sep">.</span>
                                            <input class="dirty-check" ng-model="rangeIPEnd[2]" name="ip3end" type="text" ng-required="true" autocomplete="off" pattern="^([1-9]?[0-9]|[1][0-9][0-9]|2[0-4][0-9]|25[0-5])$" custom-validate="bigger3" ng-model-options="{ allowInvalid: true }" ng-change="triggerValid3()">
                                            <span class="sep">.</span>
                                            <input class="dirty-check" ng-model="rangeIPEnd[3]" name="ip4end" type="text" ng-required="true" autocomplete="off" pattern="^([1-9]|[1-9][0-9]|[1][0-9][0-9]|2[0-4][0-9]|25[0-5])$" custom-validate="bigger4" ng-model-options="{ allowInvalid: true }" ng-change="triggerValid4()">                     
                                        </div>                                       
                                     </div>
                                     
                                     <div class="remark-container">
                                        <h3 class="title">备注</h3>
                                        <input name="remark" class="remark" placeholder="请输入备注" ng-model="remark" maxlength="200" unicode-length-validator></textarea>                                    
                                     </div>
                                  </form>
                              </div>
                              <div class="hint"><span>设置IP白名单后，只有白名单IP范围内的IP可以调用API，请谨慎操作</span></div>
                              <div class="messages" ng-class={'has-error':error} >
                                <div class="message" ng-if="error" ng-bind="error"></div>
                              </div>
                              <div ng-messages="ipForm.ip1.$error" class="messages" ng-class={'has-error':ipForm.ip1.$invalid}>
                                <div ng-message="required" class="message">您输入的IPv4地址第一段必须完整</div>
                                <div ng-message="pattern" class="message">您输入的IPv4地址第一段必须介于0-255间</div>
                              </div>
                              <div ng-messages="ipForm.ip2.$error" class="messages" ng-class={'has-error':ipForm.ip2.$invalid}>
                                <div ng-message="required" class="message">您输入的IPv4地址第二段必须完整</div>
                                <div ng-message="pattern" class="message">您输入的IPv4地址第二段必须介于0-255间</div>
                              </div>
                              <div ng-messages="ipForm.ip3.$error" class="messages" ng-class={'has-error':ipForm.ip3.$invalid}>
                                <div ng-message="required" class="message">您输入的IPv4地址第三段必须完整</div>
                                <div ng-message="pattern" class="message">您输入的IPv4地址第三段必须介于0-255间</div>
                              </div>
                              <div ng-messages="ipForm.ip4.$error" class="messages" ng-class={'has-error':ipForm.ip4.$invalid}>
                                <div ng-message="required" class="message">您输入的IPv4地址第四段必须完整</div>
                                <div ng-message="pattern" class="message">您输入的IPv4地址第四段必须介于1-255间，末位不能为0</div>
                              </div>
                              <div ng-messages="ipForm.ip3end.$error" class="messages" ng-class={'has-error':ipForm.ip3end.$invalid}>
                                <div ng-message="required" class="message">您输入的IPv4结束地址第三段必须完整</div>
                                <div ng-message="pattern" class="message">您输入的IPv4结束地址第三段必须介于0-255间</div>
                                <div ng-message="customValidate" class="message">您输入的IPv4结束地址须大于起始地址</div>
                              </div>
                              <div ng-messages="ipForm.ip4end.$error" class="messages" ng-class={'has-error':ipForm.ip4end.$invalid}>
                                <div ng-message="required" class="message">您输入的IPv4结束地址第四段必须完整</div>
                                <div ng-message="pattern" class="message">您输入的IPv4结束地址第四段必须介于1-255间</div>
                                <div ng-message="customValidate" class="message">您输入的IPv4结束地址须大于起始地址</div>
                              </div>
                              <div ng-messages="ipForm.remark.$error" class="messages" ng-class={'has-error':ipForm.remark.$invalid}>
                                <div ng-message="validUnicodeLength" class="message">您的输入过长，Unicode字符集不能超过250位</div>
                              </div>
                              <div class="app-loading" ng-if="loading">
                                  <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                              </div>
                          </md-dialog-content>
                          <md-dialog-actions layout="row">
                            <md-button ng-click="close()">
                              取消
                            </md-button>
                            <md-button ng-click="save()" ng-disabled="loading">
                              保存
                            </md-button>
                          </md-dialog-actions>
                      </md-dialog>`,
            /*parent: angular.element(document.body),*/
            targetEvent: ev,
            clickOutsideToClose: true,
            autoWrap: false,
            parent: angular.element(document.querySelector('body>section>md-content')),
            locals: {ip: ip}
          })
        }

        window.test = $scope
        //$scope.$on("$destroy", event => {});
      }
    ]
  }
)
