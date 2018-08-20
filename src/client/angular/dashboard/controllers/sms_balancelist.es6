define([], function () {
  'use strict'
  return ['$rootScope', '$scope', '$stateParams', '$http', '$timeout', '$mdDialog',
    ($rootScope, $scope, $stateParams, $http, $timeout, $mdDialog) => {
      let pipeQ

      $scope.columns = [{
        text: '通道名称',
        name: 'channel_name',
        style: {'text-align': 'center', 'width': 'auto'}
      }, {
        text: '通道编码',
        name: 'channel_code',
        style: {'text-align': 'center', 'width': '380px'}
      }, {
        text: '剩余数量',
        name: 'remaining_num',
        style: {'text-align': 'center', 'width': '180px'}
      }, {
        text: '最后发送时间',
        name: 'last_send_time',
        style: {'text-align': 'center', 'width': '360px'}
      }]

      let defaultPipe = {
        channel_id: '',
        channel_name: '短信全部通道'
      }
      $scope.pipeList = [defaultPipe]

      $scope.prodList = []

      $scope.reset = () => {
        $scope.loading = true
        $scope.currentPipe = defaultPipe
        pipeQ = getPipeList()
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.searcher = (index, size) => {
        $scope.refreshing = true
        return pipeQ.then(() => {
          return $scope.ajax('balance_get', {
            pageindex: index || $scope.pageIndex,
            pagesize: size || $scope.pageSize,
            channel_id: $scope.currentPipe && $scope.currentPipe.channel_id
          }, (data) => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.prodList = data.balance_list
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
        })
      }

      $scope.research = () => {
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.selectPipe = (pipe) => {
        $scope.currentPipe = pipe
        $scope.research()
      }

      function getPipeList () {
        $scope.loading = true
        return $scope.ajax('pipe_init').then((data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            let pipeList = data.channel_list
            pipeList.unshift(defaultPipe)
            $scope.pipeList = pipeList
          }
        }).finally(() => {
          $scope.loading = false
        })
      }

      // 如果传入参数则自动定位到待办事项上
      if ($stateParams.channel_id) {
        $scope.loading = true
        pipeQ = getPipeList().then(() => {
          $scope.currentPipe = [].concat.apply([],$scope.pipeList.map(r=>(r.channel_id.toLowerCase() == $stateParams.channel_id.toLowerCase())?[r]:[]))[0] || defaultPipe
        })
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      } else {
        $scope.reset()
      }


      window.test = $scope
    }]
})
