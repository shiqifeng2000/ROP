define([], function () {
  'use strict'
  return ['$rootScope', '$scope', '$http', '$stateParams', '$location', '$mdDialog', '$timeout', 'ModuleLoader', 'Upload', '$q', '$compile',
    ($rootScope, $scope, $http, $stateParams, $location, $mdDialog, $timeout, ModuleLoader, Upload, $q, $compile) => {
      $scope.byte2kb = (number) => {
        var num = !isNaN(number) ? number : ((typeof number == 'string') ? Number(number) : 0),
          numKB = Math.round(100 * num / 102400)
        return `${numKB}kb`
      }
      // 滚屏以及相关设置
      $scope.options = {
        toolbar: [
          {name: 'styles', items: ['FontSize']},
          {
            name: 'basicstyles',
            items: ['Bold', 'Italic', 'Underline', 'Strike']
          },
          {name: 'colors', items: ['TextColor', 'BGColor']},
          '/',
          {
            name: 'align',
            items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', 'Outdent', 'Indent']
          },
          {name: 'links', items: ['Link', 'Unlink']},
        ],
        font_names: 'Helvetica Neue;Microsoft YaHei;Arial/Arial, Helvetica, sans-serif;Times New Roman/Times New Roman, Times, serif;Verdana',
        customConfig: '',
        disallowedContent: 'img{width,height,float}',
        extraAllowedContent: 'img[width,height,align]',
        height: 440,
        contentsCss: ['/vendor/ckeditor/contents.css'],
        bodyClass: 'document-editor',
        format_tags: 'p;h1;h2;h3;pre',
        removeDialogTabs: 'image:advanced;link:advanced',
        stylesSet: [
          {name: 'Marker', element: 'span', attributes: {'class': 'marker'}},
          {name: 'Cited Work', element: 'cite'},
          {name: 'Inline Quotation', element: 'q'},
          {
            name: 'Special Container',
            element: 'div',
            styles: {
              padding: '5px 10px',
              background: '#eee',
              border: '1px solid #ccc'
            }
          },
          {
            name: 'Compact table',
            element: 'table',
            attributes: {
              cellpadding: '5',
              cellspacing: '0',
              border: '1',
              bordercolor: '#ccc'
            },
            styles: {
              'border-collapse': 'collapse'
            }
          },
          {
            name: 'Borderless Table',
            element: 'table',
            styles: {'border-style': 'hidden', 'background-color': '#E6E6FA'}
          },
          {name: 'Square Bulleted List', element: 'ul', styles: {'list-style-type': 'square'}}
        ]
      }
      let reCompileEditors = (i) => {
        var elem = angular.element(`#slide${i}_editor`)
        $timeout(() => {
          elem.attr('rop-editor', '').attr("ng-model",`carousels[${i}].image_desc`)
          $compile(elem.contents())($scope)
          ModuleLoader.reload('angularEditor', elem ,$scope)
        }, 100)
      }
      $scope.carousels = [{image_desc: `<h1>我是第1个Slide</h1>`}]
      $scope.addCarousel = () => {
        var index = $scope.carousels.length
        if (index > 2) {
          $scope.warn('轮播最多不能超过3个')
          return
        }
        $scope.carousels.push({image_desc: `<h1>我是第${index + 1}个Slide</h1>`})
        $rootScope.nextTick(() => {
          //$compile(angular.element(`#ssv-carousel .item .editor-wrapper`).eq(index).contents())(angular.element(`#ssv-carousel .carousel-inner`).scope())
          $('#ssv-carousel').carousel(index)
          reCompileEditors(index)
        })
      }
      $scope.removeCarousel = (i) => {
        var index = $scope.carousels.length
        if (index < 2) {
          $scope.warn('轮播最少不能少于1个')
          return
        }
        $scope.carousels.splice(i, 1)
        $rootScope.nextTick(() => {
          $('#ssv-carousel').carousel(i - 1)
        })
      }

      // 素材弹窗
      //$scope.logo = {imageInfo: {}}
      $scope.clearLogo = () => {$scope.logo = {imageInfo: {}}}
      $scope.clearLogo()
      $scope.bigLogo = {imageInfo: {}}
      $scope.selectMaterial = (material) => $mdDialog.hide(material)
      $scope.cancelMaterialSelection = () => $mdDialog.cancel()
      $scope.showDialog = (ev, attr) => {
        $mdDialog.show({
          //controller: MaterialCtrl,
          template: `
            <md-dialog aria-label="素材管理" class="form material" aria-describedby="quick edit">
              <md-toolbar style="min-width：100%">
                <div class="md-toolbar-tools">
                  <md-icon md-svg-icon="navigation:ic_apps_24px"></md-icon>
                  <h3><span ng-bind="'素材管理'"></span></h3>
                  <md-button class="md-icon-button md-primary md-hue-1" aria-label="Settings" ng-click="cancelMaterialSelection()">
                    <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                  </md-button>
                </div>
              </md-toolbar>
              <md-dialog-content>
                <div class="group">
                  <md-list ng-cloak>
                    <md-subheader class="md-no-sticky">素材分组</md-subheader>
                    <md-list-item ng-click="selectType(type)" ng-repeat="type in types track by $index" ng-class="{'active': selectedType === type}" aria-label="分组列表">
                      <p ng-bind="type.type_name+'('+type.image_count+')'"></p>
                    </md-list-item>
                  </md-list>
                </div>
                <div class="area">
                    <div class="topArea">
                      <span>图片上传总共大小不超于48M 单张图片不超过2M</span>
                      <button class="text md-button fill" type="file" ng-model="files" ngf-select="upload($files, $invalidFiles)" ngf-multiple="true" accept="image/jpeg,image/jpg,image/png" ngf-pattern="'image/jpeg,image/jpg,image/png'" ngf-max-size="2097152" ngf-max-total-size="50331648">
                        <div class="progress"></div>
                        <span>本地上传</span>
                      </button>
                    </div>

                    <div class="drop-box" ngf-drop ng-model="files" ng-change="upload()" ngf-drag-over-class="'dragover'" ngf-multiple="true" ngf-allow-dir="true" accept="image/jpeg,image/jpg,image/png" ngf-pattern="'image/jpeg,image/jpg,image/png'" ngf-max-size="2097152" ngf-max-total-size="50331648">
                      <div class="rop-progress-bar" ng-if="progress">
                        <div class="info-bar">
                          <span class="file-name" ng-bind="progress.fileUploading.name"></span><span class="file-size" ng-bind="byte2kb(progress.fileUploaded)+'/'+byte2kb(progress.fileUploading.size)"></span><span class="number-loaded" ng-bind="progress.numberUploaded + '/' + files.length"></span>
                        </div>
                        <div class="bar"><div class="inner" ng-style="{'width':progress.percent + '%'}"></div></div>
                      </div>
                      <div class="content">
                        <div class="item" ng-repeat="file in tableData track by $index" ng-click="tableData._select = file" ng-dblclick="(tableData._select = file);selectMaterial(tableData._select)" ng-class="{'selected':tableData._select === file}">
                          <div class="m_thumbnail" ng-style="{'background-image':'url('+(file.image_url_oss||file.image_url)+')'}">
                              <div class="overlay"><md-icon md-svg-icon="navigation:ic_check_24px"></md-icon></div>
                            </div>
                            <p class="name">{{file.image_name}}</p>
                          </div>
                        </div>
                      </div>

                      <nav rop-pagination class="md-pagination" searcher="searcher" index="pageIndex" size="pageSize" total="total" infinite="infinite" compile-once></nav>
                  </div>
                  <div class="app-loading" ng-if="refreshing">
                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                  </div>
                </md-dialog-content>
                <md-dialog-actions layout="row">
                  <div class="message" ng-if="error">
                    <span ng-bind="error"></span>
                  </div>
                  <md-button ng-click="cancelMaterialSelection()">取消</md-button>
                  <md-button ng-click="selectMaterial(tableData._select)" type="submit">保存</md-button>
                </md-dialog-actions>
              </md-dialog>

            `,
          parent: angular.element('body>section>md-content'),
          targetEvent: ev,
          clickOutsideToClose: true,
          //resolve: {typeQ: typeQ},
          scope: $scope,
          preserveScope: true,
          locals: {}
        }).then((material) => {
          attr.imageInfo = material
        }).finally(() => {$scope.tableData._select = undefined})
      }

      // 网站特性
      $scope.feature = {uncheck: false, list: [{}, {}, {}, {}]}
      $scope.calcFeatureColspan = () => Math.round(60 / $scope.feature.list.length)
      $scope.appendFeatureCol = () => {
        if (($scope.feature.list.length < 5) && ($scope.feature.list.length > 2)) {
          $scope.feature.list.push({})
        } else {
          $scope.warn('网站特性块数量为3-5个')
        }
      }
      $scope.removeFeatureCol = (feature) => {
        if (($scope.feature.list.length < 6) && ($scope.feature.list.length > 3)) {
          $scope.feature.list.splice($scope.feature.list.indexOf(feature), 1)
        } else {
          $scope.warn('网站特性块数量为3-5个')
        }
      }
      //关于我们
      $scope.aboutus = {uncheck: false, newsUncheck: false}
      // 开放API
      $scope.apiAvailable = {uncheck: false}
      // 成功开发者
      $scope.successDevelopers = {uncheck: false}
      // 联系信息
      $scope.aboveFooter = {uncheck: false}
      // 是否选择
      $scope.toggleCheck = (candidate) => {candidate.uncheck = !candidate.uncheck}
      // 模式
      $scope.mode = 0
      $scope.enterMode = (cb) => {
        if ($scope.refreshing) {
          return
        }
        typeQ.then(() => {
          $scope.mode = 1
          $rootScope.globalBack = globalBack
          cb && cb.call()
        })
      }
      $scope.exitMode = (cb) => {
        if ($scope.refreshing) {
          return
        }
        $mdDialog.hide()
        $rootScope.globalBack = null
        $scope.mode = 0
        cb && cb.call()
      }

      // fab
      $scope.upload = ($files, $invalidFiles) => {
        if ($scope.progress) {
          $scope.warn('上传进行中')
          return
        }
        if ($invalidFiles && $invalidFiles.length) {
          if ((!$files || !$files.length) && (!$scope.files || !$scope.files.length)) {
            $scope.warn('无合法文件可供上传')
            return
          } else {
            $scope.warn('已阻止部分非法文件上传')
          }
        } else {
          if ((!$files || !$files.length) && (!$scope.files || !$scope.files.length)) {
            $scope.warn('无任何文件可供上传')
            return
          }
        }
        var files = $files || $scope.files
        Upload.upload({
          url: '/upload',
          method: 'POST',
          data: {
            files: files,
            module: 'application',
            partial: 'func',
            api: 'saveImage',
            param: {type_id: $scope.selectedType && (($scope.selectedType.type_id != -1) || ($scope.selectedType.type_id != '-1')) ? $scope.selectedType.type_id : ''}
          },
          arrayKey: '',
        }).then(function (response) {
          var data = response.data
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            //$scope.serverFiles = data.files
            typeQ = getTypeQ()
            $scope.research()
            if (data.msg) {
              $rootScope.warn(data.msg)
            } else {
              $rootScope.warn('上传成功', 1)
            }
          } else {
            $rootScope.warn(data.msg)
          }
        }, (response) => {
          if (response.status > 0) {
            $rootScope.alert(response.status + ': ' + response.data)
          }
        }, (evt) => {
          if (evt.type != 'load') {
            !$scope.progress && ($scope.progress = {percent: 0})
            var loadCalculation = 0
            for (var i = 0; i < files.length; i++) {
              loadCalculation += files[i].size
              if (loadCalculation >= evt.loaded) {
                $scope.progress.fileUploading = files[i]
                $scope.progress.fileUploaded = loadCalculation - evt.loaded
                $scope.progress.numberUploaded = i
                break
              }
            }
            $scope.progress.percent = Math.min(100, parseInt(100.0 * evt.loaded / evt.total))
          } else {
            $scope.progress.fileUploading = files[files.length - 1]
            $scope.progress.fileUploaded = $scope.progress.fileUploading.size
            $scope.progress.numberUploaded = files.length
            $scope.progress.percent = 100
            $scope.uploadingOSS = true
          }
        }).finally(() => {
          $scope.files = []
          $scope.uploadingOSS = undefined
          $scope.progress = undefined
        })
      }
      $scope.cancelOperation = (file) => {$scope.fileOperating = null}
      $scope.deleteImage = (file) => {
        $scope.fileOperating = {file: file, operation: 'delete'}
        $scope.cancelBatchOperation()
      }
      $scope.editImageName = (file) => {
        $scope.fileOperating = {file: file, operation: 'edit'}
        $scope.cancelBatchOperation()
      }
      $scope.changeImageType = (file) => {
        $scope.fileOperating = {
          file: file,
          operation: 'move',
          type: file ? [].concat.apply([], $scope.types.map(r => ((r.type_id == file.type_id) ? [r] : [])))[0] : ''
        }
        $scope.cancelBatchOperation()
      }
      $scope.confirmEditImage = (confirm) => {
        if (!$scope.fileOperating || !$scope.fileOperating.file || !$scope.fileOperating.file.image_id || ($scope.fileOperating.operation != 'edit')) {
          return
        }
        $scope.cancelBatchOperation()
        if (confirm) {
          $scope.refreshing = true
          $scope.ajax('saveImage', {
            image_id: $scope.fileOperating.file.image_id,
            image_name: $scope.fileOperating.file.image_name,
            // 移动分组时，移动到未分组时需要传空
            type_id: $scope.selectedType && ($scope.selectedType.type_id != -1) ? $scope.selectedType.type_id : ''
          }).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $rootScope.warn('修改成功', 1)
            }
          }).finally(() => {
            $scope.refreshing = false
            $scope.research()
            $scope.cancelOperation()
          })
        } else {
          $scope.cancelOperation()
        }
      }
      $scope.confirmDeleteImage = (confirm) => {
        if (!$scope.fileOperating || !$scope.fileOperating.file || !$scope.fileOperating.file.image_id || ($scope.fileOperating.operation != 'delete')) {
          return
        }
        $scope.cancelBatchOperation()
        if (confirm) {
          $scope.refreshing = true
          $scope.ajax('deleteImage', {image_list: [{image_id: $scope.fileOperating.file.image_id}]}).finally(() => {
            $scope.refreshing = false
            typeQ = getTypeQ()
            $scope.research()
            $scope.cancelOperation()
          }).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $rootScope.warn('删除成功', 1)
            }
          })
        } else {
          $scope.cancelOperation()
        }
      }
      $scope.confirmMoveImage = (confirm) => {
        if (!$scope.fileOperating || !$scope.fileOperating.file || !$scope.fileOperating.file.image_id || ($scope.fileOperating.operation != 'move')) {
          return
        }
        $scope.cancelBatchOperation()
        if (confirm) {
          var type = $scope.fileOperating.type_id && [].concat.apply([], $scope.types.map(r => (r.type_id == $scope.fileOperating.type_id) ? [r] : []))[0]
          $scope.refreshing = true
          $scope.ajax('saveImage', {
            image_id: $scope.fileOperating.file.image_id,
            image_name: $scope.fileOperating.file.image_name,
            // 移动分组时，移动到未分组时需要传空
            type_id: type && (type.type_id != -1) ? type.type_id : ''
          }).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $rootScope.warn('移动成功', 1)
            }
          }).finally(() => {
            $scope.refreshing = false
            typeQ = getTypeQ()
            $scope.research()
            $scope.cancelOperation()
          })
        } else {
          $scope.cancelOperation()
        }
      }
      $scope.selectAll = false
      // 逻辑流程
      $scope.loading = true
      let pushOriginalTypes = (types, all_count, ungrouped_count) => types && Array.isArray(types) && [{
          type_id: '',
          type_name: '全部图片',
          image_count: all_count
        }, {type_id: -1, type_name: '未分组', image_count: ungrouped_count}].concat(types),
        getTypeQ = () => $scope.ajax('listType').then(data => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.types = pushOriginalTypes(data.data_list, data.all_count, data.ungrouped_count)
          } else {
            $scope.types = pushOriginalTypes.concat([], data.all_count, data.ungrouped_count)
          }
          if ($scope.selectedType) {
            $scope.selectedType = [].concat.apply([], $scope.types.map(r => ((r.type_id == $scope.selectedType.type_id) ? [r] : [])))[0]
          } else {
            $scope.selectedType = $scope.types[0]
          }
        }), typeQ = getTypeQ(), getSSVHomeInfoQ = () => $scope.ajax('get_ssv_info').then((data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            if (data.user_info) {
              /*tel: $scope.aboveFooter.tel,
               //mobile: $scope.aboveFooter.mobile,
               fax: $scope.aboveFooter.fax,
               email: $scope.aboveFooter.email,
               qq: $scope.aboveFooter.qq,
               website: $scope.aboveFooter.website,
               address: $scope.aboveFooter.address,
               weixin: $scope.aboveFooter.weixin,
               weibo: $scope.aboveFooter.weibo,
               //user_intro: '',
               user_img: $scope.logo.imageInfo && $scope.logo.imageInfo.image_id,
               user_logo: $scope.bigLogo.imageInfo && $scope.bigLogo.imageInfo.image_id,
               /!*header_title: '',
               header_desc: '',
               header_img: '',*!/
               image_list: $scope.carousels && $scope.carousels.length && [].concat.apply([], $scope.carousels.map(r => {
               return r.imageInfo ? [{
               image_id: r.imageInfo.image_id,
               image_desc: r.image_desc
               }] : []
               })),
               feature_list: $scope.feature && $scope.feature.list && $scope.feature.list.length && $scope.feature.list.map(r => {
               return {
               feature_img: r.imageInfo && r.imageInfo.image_id,
               feature_title: r.feature_title,
               feature_desc: r.feature_desc
               }
               }),*/
              $scope.logo.imageInfo = {image_id: data.user_info.user_logo, image_url: data.user_info.user_logo_url}
              $scope.bigLogo.imageInfo = {image_id: data.user_info.user_img, image_url: data.user_info.user_img_url}

              data.user_info.user_image && data.user_info.user_image.length && ($scope.carousels = data.user_info.user_image.map(r => {
                return {imageInfo: {image_id: r.image_id, image_url: r.image_url}, image_desc: r.image_desc}
              }))

              $scope.feature.uncheck = (data.user_info.feature_model_flag == '0')
              if (data.user_info.user_feature && data.user_info.user_feature.length) {
                var list = []
                if ((data.user_info.user_feature.length >= 3) && (data.user_info.user_feature.length <= 5)) {
                  list = data.user_info.user_feature
                } else if (data.user_info.user_feature.length > 5) {
                  list = data.user_info.user_feature.slice(0, 5)
                } else if (data.user_info.user_feature.length < 3) {
                  list = data.user_info.user_feature
                  do {list.push({})} while (list.length < 3)
                }
                $scope.feature.list = list.map(r => {
                  return {
                    imageInfo: {image_id: r.feature_img, image_url: r.feature_img_url},
                    feature_title: r.feature_title,
                    feature_desc: r.feature_desc
                  }
                })
              }

              $scope.aboutus.imageInfo = {image_id: data.user_info.about_img, image_url: data.user_info.about_img_url}
              $scope.aboutus.about_desc = data.user_info.about_desc
              $scope.aboutus.website = data.user_info.website
              $scope.aboutus.uncheck = (data.user_info.about_model_flag == '0')

              $scope.apiAvailable.uncheck = (data.user_info.api_model_flag == '0')

              $scope.successDevelopers.uncheck = (data.user_info.isv_model_flag == '0')

              $scope.successDevelopers.isv_show_type = data.user_info.isv_show_type

              $scope.aboveFooter.address = data.user_info.address
              $scope.aboveFooter.tel = data.user_info.tel
              $scope.aboveFooter.fax = data.user_info.fax
              $scope.aboveFooter.email = data.user_info.email
              $scope.aboveFooter.qq = data.user_info.qq
              $scope.aboveFooter.weixin = data.user_info.weixin
              $scope.aboveFooter.weibo = data.user_info.weibo
              $scope.aboveFooter.uncheck = (data.user_info.contact_model_flag == '0')

              $scope.nextTick(() => {$scope.carousels.forEach((r, i) => {reCompileEditors(i)})})
              angular.element('.aboutus-editor').attr('rop-editor', '')
              $compile(angular.element('.aboutus-editor').contents())($scope)
              ModuleLoader.reload('angularEditor', '.aboutus-editor', $scope)
            }
          }
        }), ssvHomeInfoQ = getSSVHomeInfoQ()
      $q.all([typeQ, ssvHomeInfoQ]).finally(() => {$scope.loading = false})

      $scope.reset = () => {
        $scope.tableData = []
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }
      $scope.reset()
      $scope.selectType = (type) => {
        $scope.cancelOperation()
        $scope.cancelBatchOperation()
        $scope.selectedType = type
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }
      $scope.searcher = (index, size) => {
        if ($scope.refreshing) {return}

        $scope.refreshing = true
        return typeQ.then(() => $scope.ajax('listImage', {
          pageindex: index || $scope.pageIndex,
          pagesize: size || $scope.pageSize,
          type_id: $scope.selectedType && $scope.selectedType.type_id || ''
        }, (data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            var selectedImages = [].concat.apply([], $scope.tableData.map(r => (r._select ? [r.image_id] : [])))
            $scope.tableData = data.data_list
            $scope.total = data.list_count
            $scope.tableData && $scope.tableData.forEach(r => {
              if (selectedImages.indexOf(r.image_id) != -1) {
                r._select = true
              }
            })
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
      $scope.research = () => {
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }
      $scope.hasFilesSelected = () => [].concat.apply([], $scope.tableData.map(r => (r._select ? [r] : []))).length
      $scope.hasAllFilesSelected = () => $scope.tableData && $scope.tableData.length && ([].concat.apply([], $scope.tableData.map(r => (r._select ? [r] : []))).length == $scope.tableData.length)
      $scope.toggleAllFileSelected = () => {
        var value = !$scope.hasAllFilesSelected()
        $scope.cancelOperation()
        $scope.cancelBatchOperation()
        $scope.tableData.forEach(r => {r._select = value})
      }
      $scope.cancelBatchOperation = () => {
        $scope.filesOperating = null
      }
      $scope.materialManagerMessageBox = {top: 0, left: '16px'}
      $scope.createImagesType = (e) => {
        e.preventDefault()
        e.stopPropagation()
        $scope.materialManagerMessageBox.top = `${e.currentTarget.getBoundingClientRect().top - ($rootScope.minify() ? 0 : 80) - 48 + 48}px`
        $scope.nextTick(() => {
          var messageBox = angular.element('.view-frame.func .material-manager .group .message-box')[0]
          messageBox && messageBox.scrollIntoView()
        })
        $scope.filesOperating = {
          operation: 'create'
        }
        $scope.cancelOperation()
      }
      $scope.moveImages = () => {
        $scope.filesOperating = {
          files: [].concat.apply([], $scope.tableData.map(r => (r._select ? [{
            image_id: r.image_id,
            image_name: r.image_name
          }] : []))),
          operation: 'move'
        }
        $scope.cancelOperation()
      }
      $scope.deleteImages = () => {
        $scope.filesOperating = {
          files: [].concat.apply([], $scope.tableData.map(r => (r._select ? [{image_id: r.image_id}] : []))),
          operation: 'delete'
        }
        $scope.cancelOperation()
      }
      $scope.editImagesType = () => {
        $scope.filesOperating = {operation: 'edit_type', type: JSON.parse(JSON.stringify($scope.selectedType))}
        $scope.cancelOperation()
      }
      $scope.deleteImagesType = () => {
        $scope.filesOperating = {operation: 'delete_type', type: $scope.selectedType}
        $scope.cancelOperation()
      }
      $scope.confirmDeleteImages = (confirm) => {
        if (!$scope.filesOperating || !$scope.filesOperating.files || !$scope.filesOperating.files.length || ($scope.filesOperating.operation != 'delete')) {
          return
        }
        $scope.cancelOperation()
        if (confirm) {
          $scope.refreshing = true
          $scope.ajax('deleteImage', {image_list: $scope.filesOperating.files}).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $rootScope.warn('批量删除成功', 1)
            }
          }).finally(() => {
            $scope.refreshing = false
            typeQ = getTypeQ()
            $scope.research()
            $scope.cancelBatchOperation()
          })
        } else {
          $scope.cancelBatchOperation()
        }
      }
      $scope.confirmMoveImages = (confirm) => {
        if (!$scope.filesOperating || !$scope.filesOperating.files || !$scope.filesOperating.files.length || ($scope.filesOperating.operation != 'move')) {
          return
        }
        $scope.cancelOperation()
        if (confirm) {
          var type = $scope.filesOperating.type_id && [].concat.apply([], $scope.types.map(r => (r.type_id == $scope.filesOperating.type_id) ? [r] : []))[0],
            qList = $scope.filesOperating.files.map(r => $scope.ajax('saveImage', {
              image_id: r.image_id,
              image_name: r.image_name,
              // 移动分组时，移动到未分组时需要传空
              type_id: type && (type.type_id != -1) ? type.type_id : ''
            }))
          $scope.refreshing = true
          $q.all(qList).then((results) => {
            var hasSuccess, hasFailure
            results.forEach(data => {
              if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
                hasSuccess = true
              } else {
                hasFailure = true
              }
            })
            if (hasSuccess) {
              typeQ = getTypeQ()
              $scope.research()
              $scope.cancelBatchOperation()
            }

            if (hasFailure) {
              $rootScope.warn('批量移动有部分失败')
            } else {
              $rootScope.warn('批量移动成功', 1)
            }
          }).finally(() => {
            $scope.refreshing = false
          })
        } else {
          $scope.cancelBatchOperation()
        }
      }
      $scope.confirmCreateType = (confirm) => {
        if (!$scope.filesOperating || ($scope.filesOperating.operation != 'create')) {
          return
        }
        $scope.cancelOperation()
        if (confirm) {
          $scope.refreshing = true
          $scope.ajax('saveType', $scope.filesOperating.type).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $rootScope.warn('新建分组成功', 1)
            }
          }).finally(() => {
            $scope.refreshing = false
            typeQ = getTypeQ()
            $scope.cancelBatchOperation()
          })
        } else {
          $scope.cancelBatchOperation()
        }
      }
      $scope.confirmDeleteType = (confirm) => {
        if (!$scope.filesOperating || ($scope.filesOperating.operation != 'delete_type')) {
          return
        }
        $scope.cancelOperation()
        if (confirm) {
          $scope.refreshing = true
          $scope.ajax('deleteType', $scope.filesOperating.type).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $rootScope.warn('删除分组成功', 1)
            }
          }).finally(() => {
            $scope.refreshing = false
            $scope.cancelBatchOperation()
            typeQ = getTypeQ()
            $scope.reset()
          })
        } else {
          $scope.cancelBatchOperation()
        }
      }
      $scope.confirmEditType = (confirm) => {
        if (!$scope.filesOperating || ($scope.filesOperating.operation != 'edit_type')) {
          return
        }
        $scope.cancelOperation()
        if (confirm) {
          $scope.refreshing = true
          $scope.ajax('saveType', $scope.filesOperating.type).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $rootScope.warn('修改分组名成功', 1)
            }
          }).finally(() => {
            $scope.refreshing = false
            $scope.cancelBatchOperation()
            typeQ = getTypeQ()
            $scope.reset()
          })
        } else {
          $scope.cancelBatchOperation()
        }
      }
      $scope.canDeleteType = () => !$scope.tableData || !$scope.tableData.length

      var saveData = (function () {
        var a = document.createElement('a')
        document.body.appendChild(a)
        //a.style = 'display: none'
        $(a).css("display","none")
        a.target = '_blank'
        return function (url, fileName) {
          a.href = url
          a.download = fileName
          a.click()
          //window.URL.revokeObjectURL(url);
        }
      }())
      $scope.exportFile = (file) => {
        saveData(file.image_url, `${file.image_url.replace(/^.+(\..+?)$/, `${file.image_name}$1`)}`)
      }
      $scope.showPortraits = (file, ev) => {
        $mdDialog.show({
          controller(scope, file){
            scope.carousels = $scope.tableData
            scope.selectedFile = file
            scope.download = (e) => {
              e.preventDefault()
              e.stopPropagation()
              var id = angular.element('#portrait-carousel .item.active').attr('portrait-id'),
                file = [].concat.apply([], scope.carousels.map(r => (r.image_id == id) ? [r] : []))[0],
                url = file.image_url_oss || file.image_url
              saveData(url, `${url.replace(/^.+(\..+?)$/, `${file.image_name}$1`)}`)
              //angular.element(e.currentTarget).attr('download', file.image_name)
              /*angular.element(e.currentTarget).attr('download', file.image_name)
               angular.element(e.currentTarget).click()
               angular.element(e.currentTarget).attr('download', '')*/
            }
            scope.close = () => $mdDialog.hide()
            /*console.log(ev)
             console.log(angular.element('#portrait-carousel'))
             angular.element('#portrait-carousel').on('slid.bs.carousel', (e) =>{
             console.log(e)
             })*/
          },
          template: `
            <md-dialog aria-label="素材管理" class="portrait-full" aria-describedby="quick edit">
              <md-dialog-content>
                <md-button class="md-icon-button md-primary closer" aria-label="Settings" ng-click="close()">
                  <md-icon md-svg-icon="content:ic_clear_24px"></md-icon>
                </md-button>
                <div id="portrait-carousel" class="carousel slide" data-ride="carousel" data-interval="false" data-keyboard="false">
                  <!-- Indicators -->
                  <!--<ol class="carousel-indicators">
                    <li data-target="#portrait-carousel" data-slide-to="{{$index}}" ng-repeat="carousel in carousels track by $index"
                        ng-class="{'active':(carousel === file)}"></li>
                  </ol>-->
            
                  <!-- Wrapper for slides -->
                  <div class="carousel-inner" role="listbox">
                    <div class="item" ng-repeat="carousel in carousels track by $index" ng-class="{'active':(carousel.image_id == selectedFile.image_id)}" portrait-id="{{carousel.image_id}}">
                      <img ng-src="{{carousel.image_url_oss || carousel.image_url}}" />
                    </div>
                  </div>

                  <!-- Controls -->
                  <div class="carousel-controls">
                    <a class="left carousel-control" role="button" data-slide="prev" ng-href="{{'#portrait-carousel'}}">
                      <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                      <span class="sr-only">Previous</span>
                    </a>
                    <a href="javascript:" class="carousel-control center" ng-click="download($event)">
                      <span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span>
                      <span class="sr-only">下载</span>
                    </a>
                    <a class="right carousel-control" role="button" data-slide="next" ng-href="{{'#portrait-carousel'}}">
                      <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                      <span class="sr-only">Next</span>
                    </a>
                  </div>
                </div>
              </md-dialog-content>
            </md-dialog>

          `,
          parent: angular.element('body>section>md-content>.func'),
          targetEvent: ev,
          clickOutsideToClose: true,
          hasBackdrop: false,
          //scope: $scope,
          //preserveScope: true,
          /*onComplete(scope,element){
           console.log(scope)
           console.log(angular.element('#portrait-carousel',element[0]))
           angular.element('#portrait-carousel',element).on('slid.bs.carousel', (e) =>{
           console.log(e)
           })
           },*/
          locals: {file: file}
        })
      }

      $scope.saveSsv = () => {
        if ($scope.refreshing || $scope.loading) {return $q.reject()}
        if ($scope.ssvForm.$invalid) {
          $scope.ssvForm.$error.required && $scope.ssvForm.$error.required.forEach(r => {r.$setDirty(true)})
          $scope.warn('请检查输入项输入是否合法')
          return
        }
        $scope.refreshing = true
        return $scope.ajax('save_ssv_info', {
          tel: $scope.aboveFooter.tel,
          //mobile: $scope.aboveFooter.mobile,
          fax: $scope.aboveFooter.fax,
          email: $scope.aboveFooter.email,
          qq: $scope.aboveFooter.qq,
          website: $scope.aboutus.website,
          address: $scope.aboveFooter.address,
          weixin: $scope.aboveFooter.weixin,
          weibo: $scope.aboveFooter.weibo,
          //user_intro: '',
          user_img: $scope.bigLogo.imageInfo && $scope.bigLogo.imageInfo.image_id,
          user_logo: $scope.logo.imageInfo && $scope.logo.imageInfo.image_id,
          /*header_title: '',
           header_desc: '',
           header_img: '',*/
          image_list: $scope.carousels && $scope.carousels.length && [].concat.apply([], $scope.carousels.map(r => {
            return r.imageInfo ? [{
              image_id: r.imageInfo.image_id,
              image_desc: r.image_desc
            }] : []
          })),
          feature_list: $scope.feature && $scope.feature.list && $scope.feature.list.length && $scope.feature.list.map(r => {
            return {
              feature_img: r.imageInfo && r.imageInfo.image_id,
              feature_title: r.feature_title,
              feature_desc: r.feature_desc
            }
          }),
          about_img: $scope.aboutus.imageInfo && $scope.aboutus.imageInfo.image_id,
          //about_img_url: $scope.aboutus.imageInfo && $scope.aboutus.imageInfo.image_url,
          about_desc: $scope.aboutus.about_desc,
          isv_show_type: $scope.successDevelopers.isv_show_type,
          feature_model_flag: $scope.feature.uncheck ? '0' : '1',
          about_model_flag: $scope.aboutus.uncheck ? '0' : '1',
          api_model_flag: $scope.apiAvailable.uncheck ? '0' : '1',
          isv_model_flag: $scope.successDevelopers.uncheck ? '0' : '1',
          contact_model_flag: $scope.aboveFooter.uncheck ? '0' : '1',
          //function_list: [{'function_title': '', 'function_desc': ''}]
        }).then((data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.warn('保存成功', 1)
          }
        }).finally(() => {$scope.refreshing = false})
      }

      window.test = $scope


      let globalBack = () => {
          if (!$scope.refreshing) {
            $scope.exitMode()
          }
        },
        activeBody = $rootScope.throttle(() => {
          angular.element(document.activeElement).blur()
        }, 1000)
      angular.element('.view-frame>form').on('scroll', activeBody)
      $scope.$on('$destroy', event => {
        $rootScope.globalBack = null
        angular.element('.view-frame>form').off('scroll', activeBody)
      })
    }]
})
