/**
 * Created by zhangjj on 11/04/2017.
 */
define(['../../services'], function () {
  'use strict'
  return ['$rootScope', '$scope', '$q', '$http', '$mdDialog',
    ($rootScope, $scope, $q, $http, $mdDialog) => {

      $scope.catList = [
        {
          id: '',
          name: '全部'
        },
        {
          id: 'Y',
          name: '可用'
        },
        {
          id: 'N',
          name: '停用'
        }
      ]

      $scope.reset = () => {
        $scope.columns = [
          {text: '邮件地址', name: 'mail_address'},
          {text: '是否可用', name: 'status', style: {width: '160px', 'text-align': 'center'}},
          {text: '备注', name: 'remark', style: {width: '520px', 'text-align': 'center'}},
          {text: '添加时间', name: 'create_time', style: {width: '160px', 'text-align': 'center'}}]
        $scope.keyword = ''
        $scope.currentCat = $scope.catList[0]
        //$scope.tableData = []
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }
      $scope.reset()

      $scope.searcher = (index, size) => {
        $scope.refreshing = true
        var previous = $scope.tableData && $scope.tableData._select
        return $scope.ajax('list_get', {
          pageindex: index || $scope.pageIndex,
          pagesize: size || $scope.pageSize,
          mail_address: $scope.keyword,
          use_yn: $scope.currentCat.id
        }, (data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.tableData = data.data_list
            $scope.total = data.list_count
            if ($scope.tableData && $scope.tableData[0]) {
              if (previous) {
                $scope.tableData._select = [].concat.apply([], $scope.tableData.map(r => ((previous.mail_id == r.mail_id) ? [r] : [])))[0]
              } else {
                $scope.tableData._select = $scope.tableData[0]
              }
            }
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

      $scope.research = () => {
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.selectCat = (cat) => {
        $scope.currentCat = cat
        $scope.research()
      }

      $scope.deleteMail = () => {
        return $rootScope.confirm('请确认是否要删除该邮箱？', () => {
          return $scope.ajax('delete_email', {
            mail_id: $scope.tableData._select && $scope.tableData._select.mail_id
          }, (data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.research()
              $rootScope.warn('删除成功', 1)
            }
          })
        })
      }

      let UserEmailCtrl = (scope, mailData, isNew) => {
        scope.mailData = mailData
        scope.isNew = isNew

        scope.save = () => {
          if (scope.refreshing) {return}
          if (scope.mailForm.$invalid) {
            scope.mailForm.$error.required && scope.mailForm.$error.required.forEach(r => {r.$setDirty(true)})
            scope.mailForm.$error.maxlength && scope.mailForm.$error.maxlength.forEach(r => {r.$setDirty(true)})
            scope.error = '请检查输入是否正确'
            return
          }
          if (scope.mailData.type1 === '' && scope.mailData.type2 === '') {
            scope.error = '请选择邮件类型'
            return
          }
          scope.refreshing = true
          scope.mailData.mail_type = (scope.mailData.type1 === '' ? ' ' : scope.mailData.type1 + ',') + scope.mailData.type2
          return $http.post('/agent', {
            module: 'application',
            partial: 'mail',
            api: 'put_email',
            param: {
              mail_id: scope.isNew ? undefined : scope.mailData.mail_id,
              mail_address: scope.mailData.mail_address,
              type: scope.mailData.mail_type,
              remark: scope.mailData.remark
            }
          }).then(body => {
            if (((typeof body.data.is_success == 'boolean') && body.data.is_success) || ((typeof body.data.is_success == 'string') && (body.data.is_success == 'true'))) {
              scope.close()
              $scope.research()
              return body.data
            } else {
              scope.error = body.data.msg
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

      $scope.creatMail = (ev) => {
        let mailDetail = {
          mail_address: '',
          type1: '1',
          type2: '',
          remark: ''
        }
        showDialog(ev, mailDetail, true)
      }

      $scope.editMail = (ev) => {
        if ($scope.refreshing) {return}
        $scope.refreshing = true
        return $scope.ajax('detail_get', {
          mail_id: $scope.tableData._select.mail_id
        }, (data) => {
          console.log(data)
          if (data.mail_info) {
            if (data.mail_info.mail_type.indexOf('1') !== -1) {
              data.mail_info.type1 = '1'
            } else {
              data.mail_info.type1 = ''
            }
            if (data.mail_info.mail_type.indexOf('2') !== -1) {
              data.mail_info.type2 = '2'
            } else {
              data.mail_info.type2 = ''
            }
            showDialog(ev, data.mail_info, false)
          } else {
            $rootScope.alert('尚未有任何开发者')
          }
        }).finally(() => {$scope.refreshing = false})
      }

      function showDialog (ev, mailData, isNew) {
        $mdDialog.show({
          controller: UserEmailCtrl,
          template: `
          <md-dialog aria-label="isNew?添加邮箱:修改邮箱" class="form" aria-describedby="quick edit">
              <md-toolbar>
                <div class="md-toolbar-tools">
                  <md-icon md-svg-icon="navigation:ic_apps_24px"></md-icon>
                  <h3><span ng-bind="isNew?'添加邮箱':'修改邮箱'"></span></h3>
                  <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="close()">
                    <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                  </md-button>
                </div>
              </md-toolbar>
              <md-dialog-content>
                <form class="md-dialog-content postfix-input" name="mailForm" autocomplete="off">
                  <div class="input-container">
                    <label>邮箱地址</label>
                    <input type="email" name="address" maxlength="200" spellcheck="false" ng-model="mailData.mail_address"  style="text-align: left;"
                    required/>
                  </div>
                  <div class="input-container">
                    <label>邮件类型</label>
                    <md-checkbox ng-model="mailData.type1" aria-label="Checkbox 1" class="md-primary" ng-true-value="'1'" ng-false-value="''" style="margin: 0 45px 0 25px" >公告</md-checkbox>
                    <md-checkbox ng-model="mailData.type2" aria-label="Checkbox 2" class="md-primary" ng-true-value="'2'" ng-false-value="''" >通知</md-checkbox>
                  </div>
                  <md-input-container class="md-block">
                    <label>备注</label>
                    <textarea ng-model="mailData.remark" md-maxlength="200" rows="5" md-select-on-focus style="overflow: auto"></textarea>
                  </md-input-container>
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
            </md-dialog>`,
          autoWrap: false,
          targetEvent: ev,
          clickOutsideToClose: true,
          parent: angular.element(document.querySelector('body>section>md-content')),
          locals: {mailData: mailData, isNew: isNew}
        })
      }



      window.test = $scope
      //$scope.$on("$destroy", event => {});
    }]
})
