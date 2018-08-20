/**
 * Created by zhangjj on 27/03/2017.
 */
define(['../../services'], function() {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog', '$location',
    ($rootScope, $scope, $q, $http, $mdDialog, $location) => {
      $scope.columns = [
        { text: '用户账号', name: 'user_account', style: { 'text-align': 'center' } },
        { text: '用户昵称', name: 'user_name', style: { 'text-align': 'center' } },
        { text: '公司名称', name: 'company', style: { 'text-align': 'center' } },
        { text: '添加时间', name: 'create_time', style: { width: '160px', 'text-align': 'center' } }
      ]

      $scope.mode = 0

      $scope.reset = () => {
        $scope.keyword = ''
        $scope.tableData = []
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }


      $scope.reset()

      $scope.research = () => {
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.searcher = (index, size) => {
        if ($scope.loading) { return }
        $scope.loading = true
        var previous = $scope.tableData && $scope.tableData._select
        return $rootScope.ajax('list', {
          pageindex: index || $scope.pageIndex,
          pagesize: size || $scope.pageSize,
          user_name: $scope.keyword
        }).then((data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.tableData = data.user_list
            if (previous) {
              $scope.tableData._select = [].concat.apply([], $scope.tableData.map(r => ((previous.sub_user_id == r.sub_user_id) ? [r] : [])))[0]
            } else {
              $scope.tableData._select = $scope.tableData[0]
            }
            $scope.total = data.list_count
          } else {
            $rootScope.alert(data.msg)
            $scope.total = 0
          }
        }).finally(() => {
          $scope.loading = false
        })
      }

      $scope.deleteSubuser = () => {
        return $rootScope.confirm('确定要删除该账号？', () => {
          $scope.refreshing = true
          $rootScope.ajax('delete', {
            sub_user_id: $scope.tableData._select.sub_user_id
          }).then((data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.research()
            }
          }).finally(() => {
            $scope.refreshing = false
          })
        })
      }

      let EditSubuserCtrl = (scope, subuser) => {
        scope.subuser = subuser
        scope.save = () => {
          if (scope.refreshing) { return }
          if (scope.subuserForm.$invalid) {
            scope.subuserForm.$error.required && scope.subuserForm.$error.required.forEach(r => { r.$setDirty(true) })
            scope.subuserForm.$error.validUnicodeLength && scope.subuserForm.$error.validUnicodeLength.forEach(r => { r.$setDirty(true) })
            scope.subuserForm.$error.maxlength && scope.subuserForm.$error.maxlength.forEach(r => { r.$setDirty(true) })
            scope.error = '请检查输入是否正确'
            return
          }
          scope.refreshing = true
          return $http.post('/agent', {
            module: 'application',
            partial: $rootScope.tab.key,
            api: 'save',
            param: {
              sub_user_id: scope.subuser.sub_user_id,
              user_account: scope.subuser.user_account,
              password: scope.subuser.password ? scope.subuser.password : undefined,
              user_name: scope.subuser.user_name,
              company: scope.subuser.company,
              department: scope.subuser.department,
              tel: scope.subuser.tel,
              mobile: scope.subuser.mobile,
              email: scope.subuser.email,
              qq: scope.subuser.qq,
              remark: scope.subuser.remark
            }
          }).then(body => {
            if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
              scope.close()
              scope.subuser && scope.subuser.sub_user_id ? $scope.searcher($scope.pageIndex, $scope.pageSize) : $scope.reset()
              return
            } else {
              scope.error = body.data.msg
              return $q.reject(body.data.msg)
            }
          }, why => {
            scope.error = why
            return $q.reject(why)
          }).finally(() => { scope.refreshing = false })
        }

        scope.close = () => {
          return $mdDialog.hide()
        }
      }

      $scope.showSubuser = (ev, subuser) => {
        if ($scope.refreshing) { return }
        if (!subuser) {
          subuser = {
            user_account: '',
            password: '',
            user_name: '',
            company: '',
            department: '',
            tel: '',
            mobile: '',
            email: '',
            qq: '',
            remark: ''
          }
          showSubuser(ev, subuser)
        } else {
          $scope.refreshing = true
          $rootScope.ajax('detail', {
            sub_user_id: subuser.sub_user_id
          }).then((data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              subuser = {
                sub_user_id: data.user_info.sub_user_id,
                user_account: data.user_info.user_account,
                password: data.user_info.password,
                user_name: data.user_info.user_name,
                company: data.user_info.company,
                department: data.user_info.department,
                tel: data.user_info.tel,
                mobile: data.user_info.mobile,
                email: data.user_info.email,
                qq: data.user_info.qq,
                remark: data.user_info.remark
              }
              showSubuser(ev, subuser)
            }
          }).finally(() => { $scope.refreshing = false })
        }
      }

      function showSubuser(ev, subuser) {
        $mdDialog.show({
          controller: EditSubuserCtrl,
          template: `
          <md-dialog aria-label="{{!subuser.sub_user_id?'添加子账号':'修改子账号'}}" class="form" aria-describedby="quick edit" style="max-height: initial;">
            <md-toolbar>
              <div class="md-toolbar-tools">
                <md-icon md-svg-icon="navigation:ic_apps_24px"></md-icon>
                <h3><span ng-bind="!subuser.sub_user_id?'添加子账号':'修改子账号'"></span></h3>
                <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                  <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                </md-button>
              </div>
            </md-toolbar>
            <md-dialog-content>
              <form class="md-dialog-content postfix-input" name="subuserForm" autocomplete="off">
                <div class="input-container">
                  <label>用户账号*</label>
                  <input type="text" name="name" spellcheck="false" ng-model="subuser.user_account"  style="text-align: left;" required maxlength="25" unicode-length-validator/>
                </div>
                <div class="input-container">
                  <label>用户密码{{subuser.sub_user_id ? '' : '*'}}</label>
                  <input type="text" name="name" spellcheck="false" ng-model="subuser.password"  style="text-align: left;" ng-required="!subuser.sub_user_id" minlength="6" maxlength="25"  unicode-length-validator/>
                </div>
                <div class="input-container">
                  <label>用户昵称*</label>
                  <input type="text" name="name" maxlength="15" spellcheck="false" ng-model="subuser.user_name"  style="text-align: left;" required />
                </div>
                <div class="input-container">
                  <label>用户公司*</label>
                  <input type="text" name="name" maxlength="100" spellcheck="false" ng-model="subuser.company"  style="text-align: left;" required unicode-length-validator/>
                </div>
                <div class="input-container">
                  <label>用户部门</label>
                  <input type="text" name="name" maxlength="100" spellcheck="false" ng-model="subuser.department"  style="text-align: left;" unicode-length-validator/>
                </div>
                <div class="input-container">
                  <label>用户电话</label>
                  <input type="text" name="name" maxlength="25" spellcheck="false" ng-model="subuser.tel" ng-pattern="'([0-9]*-{0,1}[0-9]*)'" style="text-align: left;" unicode-length-validator/>
                </div>
                <div class="input-container">
                  <label>用户手机</label>
                  <input type="text" name="name" maxlength="25" spellcheck="false" ng-model="subuser.mobile" ng-pattern="'([0-9]*)'" style="text-align: left;" unicode-length-validator/>
                </div>
                <div class="input-container">
                  <label>用户邮箱</label>
                  <input type="email" name="name" maxlength="500" spellcheck="false" ng-model="subuser.email"  style="text-align: left;"  unicode-length-validator/>
                </div>
                <div class="input-container">
                  <label>用户QQ</label>
                  <input type="text" name="name" maxlength="25" spellcheck="false" ng-pattern="'([0-9]*)'" ng-model="subuser.qq"  style="text-align: left;" unicode-length-validator/>
                </div>
                <md-input-container class="md-block">
                  <label>备注</label>
                  <textarea ng-model="subuser.remark" md-maxlength="100" rows="3" md-select-on-focus style="overflow: auto"></textarea>
                </md-input-container>
                <div class="hint" ng-if="!subuser.sub_user_id" aria-hidden="false" style="font-size: 12px;
                    line-height: 14px;height: 28px;
                    transition: all .3s cubic-bezier(0.55,0,0.55,0.2);
                    color: rgba(0,0,0,0.38);">设置子账号信息后，您需要维护子账号的“权限设置。<br>
子账号登录时，登录规则为“主账号登录帐号:子账号用户账号”。例如：“ruixue_ssv:laurence”。
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
              <md-button ng-click="save()" type="submit">保存</md-button>
            </md-dialog-actions>
          </md-dialog>
          `,
          parent: angular.element('body>section>md-content'),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: { subuser: subuser }
        })
      }

      $scope.showPermission = () => {
        if ($scope.refreshing || !$scope.tableData._select) {
          return
        }
        $scope._checked = false
        $scope.permissionList = []
        $scope._permission = null
        $scope.mode = 1
        $scope.refreshing = true
        $rootScope.ajax('permission_get', {
          sub_user_id: $scope.tableData._select.sub_user_id
        }).then((data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.permissionList = data.func_list
            if (Array.isArray($scope.permissionList) && $scope.permissionList.length > 0) {
              $scope._permission = $scope.permissionList[0]
            }
          }
        }).finally(() => {
          $scope.refreshing = false
        })
      }

      $scope.savePermission = () => {
        if ($scope.refreshing || !$scope.tableData._select) {
          return
        }
        $scope.refreshing = true
        let func_list = []
        $scope.permissionList.forEach(per => {
          if (per.checked === '1') {
            func_list.push({ 'func_id': per.func_id })
          }
          per.sub_func_list.forEach(sub => {
            if (sub.checked === '1') {
              func_list.push({ 'func_id': sub.func_id })
            }
            sub.sub_func_role.forEach(role => {
              if (role.checked === '1') {
                func_list.push({ 'func_id': role.func_id })
              }
            })
          })
        })
        $rootScope.ajax('permission_save', {
          sub_user_id: $scope.tableData._select.sub_user_id,
          func_list: func_list
        }).then((data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.backToFistStep()
          }
        }).finally(() => {
          $scope.refreshing = false
        })
      }

      $scope.backToFistStep = () => {
        $scope.mode = 0
        $scope.searcher()
      }

      $scope.checkPermission = (permission) => {
        let value = permission.checked
        for (let subpermission of permission.sub_func_list) {
          for (let role of subpermission.sub_func_role) {
            role.checked = value
          }
          subpermission.checked = value
        }
      }

      $scope.checkSubpermission = (subpermission) => {
        let value = subpermission.checked
        for (let role of subpermission.sub_func_role) {
          role.checked = value
        }
        if (value === '1') {
          for (let permission of $scope.permissionList) {
            if (permission.sub_func_list.some((sub) => { return sub.func_id === subpermission.func_id })) {
              permission.checked = '1'
              break;
            }
          }
        }
      }

      $scope.checkRole = (role) => {
        if (role.checked === '1') {
          for (let permission of $scope.permissionList) {
            let _subpermission = null
            for (let subpermission of permission.sub_func_list) {
              if (subpermission.sub_func_role.some((item) => {
                  return item.func_id === role.func_id
                })) {
                subpermission.checked = '1'
                _subpermission = subpermission
                break;
              }
            }
            if (_subpermission) {
              permission.checked = '1'
              break;
            }
          }
        }
      }

      $scope.selectPermission = (permission) => {
        $scope._permission = permission
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
        if (!$scope.refreshing && !$scope.refreshingUser && !$scope.refreshingProd && !$scope.loading) {
          $scope.backToFistStep()
        }
      }
      $scope.$on('$destroy', event => {
        $rootScope.globalBack = null
      })
    }
  ]
})
