/**
 * Created by robin on 22/11/2016.
 */
define(['../../services'], function (cta) {
    'use strict'
    return ['$rootScope', '$scope', '$q', '$location', '$http', '$timeout', '$mdDialog', 'MiscTool', 'ROPDateUtil',
      ($rootScope, $scope, $q, $location, $http, $timeout, $mdDialog, MiscTool, ROPDateUtil) => {
        $scope.columns = [
          {
            text: '发送日期',
            name: 'send_time',
            formatter: str => {
              var result = ''
              try {
                result = ROPDateUtil.freeFormatDate(new Date(str), 'yyyy-MM-dd')
              } catch (e) {}
              return result
            },
            style: {width: '196px', 'text-align': 'center'}
          },
          {text: '发送次数', name: 'send_count', style: {'text-align': 'center'}},
          {text: '计费次数', name: 'billing_num', style: {'text-align': 'center'}},
        ]
        $scope.loading = true
        let initQ = $scope.ajax('init').then(data => {
          $scope.channels = data.channel_list
          $scope.signs = data.append_name_list
          return data
        }).finally(() => {$scope.loading = false})

        $scope.chooseChannel = channel => {
          $scope.selectChannel = channel
          $scope.research()
        }
        $scope.chooseSign = sign => {
          $scope.selectSign = sign
          $scope.research()
        }

        $scope.reset = () => {
          $scope.selectChannel = null
          $scope.selectSign = null
          $scope.now = new Date()
          $scope.mindate = ROPDateUtil.incrementDays($scope.now, -3)
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
          $scope.tableData = []
          return initQ.then(() => $scope.ajax('list', {
            pageindex: index || $scope.pageIndex,
            pagesize: size || $scope.pageSize,
            channel_id: $scope.selectChannel ? $scope.selectChannel.channel_id : '',
            append_name: $scope.selectSign || '',
            send_time_begin: ROPDateUtil.freeFormatDate($scope.mindate, 'yyyy-MM-dd'),
            send_time_end: ROPDateUtil.freeFormatDate($scope.maxdate, 'yyyy-MM-dd')
          }).then((data) => {
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
          })).finally(() => {
            $scope.refreshing = false
          })
        }

        $scope.reset()

        window.test = $scope
        //$scope.$on("$destroy", event => {});
      }
    ]
  }
)
