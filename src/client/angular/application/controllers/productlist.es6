/**
 * Created by robin on 22/11/2016.
 */
define([], function () {
  'use strict'
  return ['$rootScope', '$scope', '$http', '$mdDialog', 'MiscTool', '$location', ($rootScope, $scope, $http, $mdDialog, MiscTool, $location) => {
    $scope.mode = 0
    $scope.enterMode = (mode, cb) => {
      $scope.mode = mode
      cb && cb.call()
    }
    $scope.exitMode = (cb) => {
      $scope.mode = 0
      cb && cb.call()
    }

    // 主页面的功能数据
    $scope.panelSelection = {}
    let initName = {id: '', name: '全部'}, initType = {
      type_id: '',
      type_name: '全部分类'
    }, mainQ = $scope.ajax('init', (data) => {
      $scope.originalPanel = JSON.parse(JSON.stringify(data))
      $scope.panel = data
    })
    $scope.reset = () => {
      $scope.columns = [
        {text: '产品名称', name: 'product_name'},
        {text: '产品分类', name: 'product_type_name', style: {width: '128px', 'text-align': 'center'}},
        {text: '添加时间', name: 'create_time', sort: '1', style: {width: '184px', 'text-align': 'center'}},
        {
          text: '显示产品价格',
          name: 'price_list',
          formatter: array => array.map(item => `价格：${item.price}, 数量：${item.amount}`).join(';'),
          tooltip: 'price_list'
        }]
      $scope.product_keyword = ''
      mainQ.then(() => {
        $scope.panelSelection.panelName = initName
        $scope.panelSelection.panelType = initType
        $scope.panelSelection.sorter = {name: '', sort: '0'}
        $scope.columns = [
          {text: '产品名称', name: 'product_name'},
          {text: '产品分类', name: 'product_type_name', style: {width: '128px', 'text-align': 'center'}},
          {text: '添加时间', name: 'create_time', sort: '0', style: {width: '184px', 'text-align': 'center'}},
          {
            text: '显示产品价格',
            name: 'price_list',
            formatter: array => array.map(item => `价格：${item.price}, 数量：${item.amount}`).join('； '),
            tooltip: 'price_list'
          }]
        $scope.product_type = ''
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      })
      //$scope.searcher();
    }
    $scope.reset()
    $scope.chooseName = (nameObj) => {
      $scope.panelSelection.panelName = nameObj || initName
      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
      //$scope.searcher();
    }

    $scope.searcher = (index, size) => {
      return mainQ.then(() => {
        $scope.refreshing = true
        var previous = $scope.tableData && $scope.tableData._select
        return $scope.ajax('list', {
          pageindex: index || $scope.pageIndex,
          pagesize: size || $scope.pageSize,
          product_name: $scope.product_keyword,
          product_type: $scope.panelSelection.panelType.type_id,
          sort_name: (!$scope.panelSelection.sorter.name || ($scope.panelSelection.sorter.name == 'create_time')) ? 'rx_insertTime' : $scope.panelSelection.sorter.name,
          sort_flag: $scope.panelSelection.sorter.sort,
        }, (data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.tableData = data.data_list
            $scope.total = data.list_count
            if ($scope.tableData && $scope.tableData[0]) {
              if (previous) {
                $scope.tableData._select = [].concat.apply([], $scope.tableData.map(r => ((previous.product_id == r.product_id) ? [r] : [])))[0]
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
      })
    }
    $scope.tableData = []
    $scope.research = () => {
      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
    }
    $scope.canVisistProduct = () => {
      return $scope.tableData && $scope.tableData._select
    }
    $scope.canInsertProduct = () => $rootScope.validateBtnRole('btnInsert')
    $scope.canDeleteProduct = (array) => {
      if (!array || !array.length || !array[0] || !$rootScope.validateBtnRole('btnDelete')) {
        return false
      }
      return true
      /*let result = true;
       array.forEach((r, i)=> {
       ((r.status != "0") && (r.status != "1") && (r.status != "2") || (r.is_old != "0")) && (result = false)
       });
       return result;*/
    }
    $scope.canUpdateProduct = (array) => {
      if (!array || !array.length || !array[0] || !$rootScope.validateBtnRole('btnUpdate')) {
        return false
      }
      return true
      /*let result = true;
       array.forEach((r, i)=> {
       ((r.status != "0") && (r.status != "1") && (r.status != "2") && (r.status != "3") && (r.status != "6") && (r.status != "101") && (r.status != "103") || (r.is_old != "0")) && (result = false)
       });
       return result;*/
    }
    $scope.deleteProduct = (row) => {
      return $rootScope.confirm('请确认是否要删除产品？', () => {
        return $scope.ajax('delete', {product_id: row.product_id}, (data) => {
          $scope.research()
          $rootScope.warn('删除成功', 1)
        })
      })
    }
    $scope.chooseType = (cat, selection) => {
      selection && (selection.panelType = cat || initType)
      $scope.pageIndex = 1
      $scope.pageSize = new Number(10)
    }

    // 模式1，修改，添加domain的功能数据
    let initialUpdaterProduct = {
      product_name: '',
      remark: ''
    }, initialSteps = [{name: '基本信息'}, {name: 'API列表'}, {name: '产品定价'}]
    $scope.updaterProduct = JSON.parse(JSON.stringify(initialUpdaterProduct))
    $scope.step = 0
    $scope.steps = initialSteps
    $scope.updaterSelection = {panelType: initType, api_list: []}

    $scope.updateProductMode = (row, forview) => {
      mainQ.then(data => $scope.ajax('detail', {product_id: row.product_id}, (data) => {
        $scope.mode = 1;
        ($scope.step != 0) && ($scope.step = 0)
        $scope.steps = initialSteps
        $scope.updaterProduct = data
        if ($scope.updaterProduct.product_info && $scope.updaterProduct.product_info.product_type) {
          $scope.updaterSelection.panelType = [].concat.apply([], $scope.panel.product_type.map(r => (r.type_id == $scope.updaterProduct.product_info.product_type) ? [r] : []))[0]
        } else {
          $scope.updaterSelection.panelType = $scope.panel.product_type[0]
        }
        $scope.updaterProduct._product_api_list = data.product_api_list ? JSON.parse(JSON.stringify(data.product_api_list)) : [];
        $scope.updaterProduct._api_list = data.api_list ? JSON.parse(JSON.stringify(data.api_list)) : []
        !$scope.updaterProduct.price_list && ($scope.updaterProduct.price_list = [{}, {}])
        $scope.updaterProduct._forView = (forview)
      }), e => {$rootScope.alert(e)})
    }

    $scope.nextStep = () => {
      if ($scope.updaterProduct._forView) {
        ($scope.step < 2) && $scope.step++
        return
      }
      if ($scope.updaterProductForm.$invalid) {
        $scope.updaterProductForm.$error.required && $scope.updaterProductForm.$error.required.forEach(r => {r.$setDirty(true)})
        return
      }
      ($scope.step < 2) && $scope.step++
    }

    $scope.previousStep = () => {($scope.step > 0) && $scope.step--}
    $scope.cancelStep = () => {
      $scope.updaterProduct = JSON.parse(JSON.stringify(initialUpdaterProduct))
      $scope.updaterProductForm.$setPristine()
      $scope.mode = 0
      $scope.step = 0
      $scope.updaterSelection = {panelType: initType, api_list: []}
    }

    $scope.appendAPI = row => {
      $scope.appendRow(row, $scope.updaterProduct._product_api_list)
      MiscTool.append([], '#choosenApiScroller')
      MiscTool.splice($scope.updaterProduct._api_list, row, '#candidateApiScroller')
    }
    $scope.removeAPI = row => {
      MiscTool.splice($scope.updaterProduct._product_api_list, row, '#choosenApiScroller')
      MiscTool.append([], '#candidateApiScroller')
      $scope.appendRow(row, $scope.updaterProduct._api_list)
    }
    $scope.appendRow = (row, list) => {
      list.push(row && (list.indexOf(row) == -1) ? row : {})
    }
    $scope.locator = (key, list, selector) => {
      var $el = angular.element(selector).eq(0),
        index = [].concat.apply([], list.map((r, i) => ((r.api_name.indexOf(key) != -1) || (r.api_title.indexOf(key) != -1)) ? [i] : []))[0]
      $el.animate({scrollTop: index * 40})
    }
    $scope.append = (list, selector) => {
      $rootScope.throttle(MiscTool.append, 600)(list, selector)
    }
    $scope.splice = (list, row, selector) => {
      $rootScope.throttle(MiscTool.splice, 600)(list, row, selector)
    }
    $scope.saveProduct = () => {
      if ($scope.refreshing) {return}

      if (!$scope.updaterProduct) {
        $scope.alert('没有初始化数据')
        return
      }
      if ($scope.updaterProductForm.$invalid) {
        $scope.updaterProductForm.$error.required && $scope.updaterProductForm.$error.required.forEach(r => {r.$setDirty(true)})
        return
      }
      let product = {
        product_id: $scope.updaterProduct.product_info.product_id,
        product_name: $scope.updaterProduct.product_info.product_name,
        product_type: $scope.updaterSelection.panelType.type_id,
        remark: $scope.updaterProduct.product_info.remark,
        price_list: [].concat.apply([], $scope.updaterProduct.price_list.map(r => r.price && r.amount ? [{
          id: r.id,
          product_price: r.price,
          product_amount: r.amount
        }] : [])),
        api_list: $scope.updaterProduct._product_api_list
      }
      if (!product.product_name || !product.product_type || !product.remark) {
        $scope.alert('基本信息不能为空')
        return
      }
      if (!product.api_list || !product.api_list.length) {
        $scope.alert('API不能为空')
        return
      }
      if (!product.price_list || !product.price_list.length) {
        $scope.alert('价格不能为空')
        return
      }
      return $scope.ajax('save', product).then((data) => {
        $scope.refreshing = false
        $scope.exitMode()
        $scope.step = 0
        product.product_id ? $scope.searcher() : $scope.research()
        $scope.updaterProductForm.$setPristine()
        $scope.updaterProduct = JSON.parse(JSON.stringify(initialUpdaterProduct))
        $rootScope.warn('操作成功', 1)
      }, why => {$scope.refreshing = false})
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
      if (!$scope.refreshing) {
        $scope.exitMode()
      }
    }
    $scope.$on('$destroy', event => {
      $rootScope.globalBack = null
    })
  }]
})
