/**
 * Created by robin on 22/11/2016.
 */
define(['../../services'], function (cta) {
    'use strict'
    return ['$rootScope', '$scope', '$q', '$location', '$http', '$timeout', '$mdDialog', 'MiscTool', 'ROPDateUtil',
      ($rootScope, $scope, $q, $location, $http, $timeout, $mdDialog, MiscTool, ROPDateUtil) => {
        $scope.columns = [
          {text: '通道名称', name: 'channel_name',style: {width: '176px', 'text-align': 'center'}},
          {text: '短信内容', name: 'sms_content'},
          {text: '接收短信手机', name: 'send_mobile',style: {width: '176px', 'text-align': 'center'}},
          {text: '发送结果', name: 'succeed_yn',style: {width: '88px', 'text-align': 'center'}},
          {
            text: '发送时间',
            name: 'send_time',
            formatter: str => {
              var result = ''
              try {
                result = ROPDateUtil.freeFormatDate(new Date(str), 'yyyy-MM-dd HH:mm:ss')
              } catch (e) {}
              return result
            },
            style: {width: '196px', 'text-align': 'center'}
          }
        ]
        $scope.loading = true
        let initQ = $scope.ajax('init').then(data => {
          $scope.channels = data.channel_list
          return data
        }).finally(() => {$scope.loading = false})

        $scope.chooseChannel = channel =>{
          $scope.selectChannel = channel
          $scope.research()
        }

        $scope.reset = () => {
          $scope.selectChannel = null
          $scope.now = new Date()
          $scope.mindate = ROPDateUtil.incrementDays($scope.now, -365)
          $scope.maxdate = new Date()

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
          return initQ.then(() => $scope.ajax('list', {
            pageindex: index || $scope.pageIndex,
            pagesize: size || $scope.pageSize,
            channel_id: $scope.selectChannel?$scope.selectChannel.channel_id:'',
            send_time_begin: ROPDateUtil.freeFormatDate($scope.mindate, 'yyyy-MM-dd'),
            send_time_end: ROPDateUtil.freeFormatDate($scope.maxdate, 'yyyy-MM-dd')
          }, (data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.tableData = data.send_list
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
          }))
        }

        $scope.export = () => {
          if ($scope.refreshing) {return $q.reject()}
          $scope.refreshing = true
          return $scope.ajax('export', {}).then(data => {
            if ($rootScope.browserType == 'Chrome') {
              let a = window.document.createElement('a')
              a.href = data.export_url
              a.download = true
              a.click()
            } else if ($rootScope.browserType == 'Safari') {
              window.location.href = data.export_url
            }  else {
              window.open(data.export_url, '_blank')
            }
          }).finally(() => {$scope.refreshing = false})
        }

        $scope.reset()

        window.test = $scope
        //$scope.$on("$destroy", event => {});
      }
    ]
  }
)
