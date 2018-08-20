/**
 * Created by robin on 22/11/2016.
 */
define(['../../services'], function () {
  'use strict'
  return ['$rootScope', '$scope', '$http', '$stateParams', '$location', '$mdDialog', '$q', 'ModuleLoader',
    ($rootScope, $scope, $http, $stateParams, $location, $mdDialog, $q, ModuleLoader) => {
      $scope.reset = () => {
        $scope.columns = [
          {
            text: '文档名称',
            name: 'doc_name',
            tooltip: true,
            linker: {
              create: row => {return `${Constant.protocol}://${Constant.host}:${Constant.port}/welcome/document/${row.doc_id}`},
            target: '_blank'
            }
          },
          {
            text: '添加时间',
            name: 'create_time',
            style: {width: '196px', 'text-align': 'center'}
          }]
        $scope.keyword = ''
        $scope.batch = false
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
        $scope.mode = 0
        $scope.doc = {
          doc_id: '',
          doc_name: '',
          doc_content: ''
        }
      }
      $scope.reset()

      $scope.searcher = (index, size) => {
        $scope.refreshing = true
        var previous = $scope.tableData && $scope.tableData._select
        return $scope.ajax('list', {
          pageindex: index || $scope.pageIndex,
          pagesize: size || $scope.pageSize,
          doc_name: $scope.keyword
        }, (data) => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.tableData = data.data_list
            if ($scope.tableData && $scope.tableData[0]) {
              if (previous) {
                $scope.tableData._select = [].concat.apply([], $scope.tableData.map(r => ((previous.doc_id == r.doc_id) ? [r] : [])))[0]
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
      $scope.tableData = []
      $scope.research = () => {
        $scope.pageIndex = 1
        $scope.pageSize = new Number(10)
      }

      $scope.canOperate = () => ($scope.tableData._select)

      $scope.save = () => {
        if ($scope.refreshing) {return}
        if ($scope.docForm.$invalid) {
          $scope.docForm.$error.required && $scope.docForm.$error.required.forEach(r => {
            r.$setDirty(true)
          })
          return
        }
        if(!$scope.doc || !$scope.doc.doc_content){
          $rootScope.warn("编辑内容不能为空")
          return
        }/* else if ($scope.doc.doc_content.length > 500){
          $rootScope.warn("编辑内容不能超过500个字符")
        }*/

        $scope.refreshing = true
        return $scope.ajax('save', {
          doc_id: $scope.doc.doc_id,
          doc_name: $scope.doc.doc_name,
          doc_content: $scope.doc.doc_content
        }).then(data => {
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            $scope.mode = 0
            if ($scope.doc.doc_id) {
              $scope.searcher()
            } else {
              $scope.reset()
            }
          } else {
            $rootScope.alert(data.msg)
          }
        }).finally(() => {$scope.refreshing = false})
      }

      $scope.deleteDoc = (row) => {
        return $rootScope.confirm('请确认是否要删除文档？', () => {
          return $scope.ajax('delete', {doc_id: $scope.tableData._select.doc_id}, (data) => {
            $rootScope.warn('删除成功', 1)
            $scope.research()
          })
        })
      }

      //$scope.content = `<h1 style="text-align:center"><span style="font-family:Georgia,serif"><span style="color:#006699">Recognition of Achievement</span></span></h1><p style="text-align:justify"><span style="font-family:Georgia,serif">This letter acknowledges the invaluable input <strong>you</strong>, as a member of our <em>Innovation Team</em>,&nbsp;have provided in the “Implement Rich Text Editor”&nbsp;project. The Management would like to hereby thank you for this great accomplishment that was delivered in a timely fashion, up to the highest company standards, and with great results:</span></p><table border="1" cellpadding="5" cellspacing="0" summary="Project Schedule" style="border-collapse:collapse; width:100%"><thead><tr><th scope="col" style="background-color:#cccccc"><span style="font-family:Georgia,serif">Project Phase</span></th><th scope="col" style="background-color:#cccccc"><span style="font-family:Georgia,serif">Deadline</span></th><th scope="col" style="background-color:#cccccc"><span style="font-family:Georgia,serif">Status</span></th></tr></thead><tbody><tr><td><span style="font-family:Georgia,serif">Phase 1: Market research</span></td><td style="text-align:center"><span style="font-family:Georgia,serif">2016-10-15</span></td><td style="text-align:center"><span style="font-family:Georgia,serif"><span style="color:#19b159">✓</span></span></td></tr><tr><td style="background-color:#eeeeee"><span style="font-family:Georgia,serif">Phase 2: Editor implementation</span></td><td style="background-color:#eeeeee; text-align:center"><span style="font-family:Georgia,serif">2016-10-20</span></td><td style="background-color:#eeeeee; text-align:center"><span style="font-family:Georgia,serif"><span style="color:#19b159">✓</span></span></td></tr><tr><td><span style="font-family:Georgia,serif">Phase 3: Rollout to Production</span></td><td style="text-align:center"><span style="font-family:Georgia,serif">2016-10-22</span></td><td style="text-align:center"><span style="font-family:Georgia,serif"><span style="color:#19b159">✓</span></span></td></tr></tbody></table><p style="text-align:justify"><span style="font-family:Georgia,serif">The project that you participated in is of utmost importance to the future success of our platform. &nbsp;We are very proud to share that&nbsp;the&nbsp;CKEditor implementation was a huge success and brought congratulations from both the key Stakeholders and the Customers:</span></p><p style="text-align:center">This new editor has totally changed our content creation experience!</p><p style="text-align:center">— John F. Smith, CEO, The New Web</p><p style="text-align:justify"><span style="font-family:Georgia,serif">This letter recognizes that much of our success is directly attributable to your efforts.&nbsp;You deserve to be proud of your achievement. May your future efforts be equally successful and rewarding.</span></p><p style="text-align:justify"><span style="font-family:Georgia,serif">I am sure we will be seeing and hearing a great deal more about your accomplishments in the future. Keep up the good work!</span></p><p><br></p><p><span style="font-family:Georgia,serif">Best regards,</span></p><p><span style="font-family:Georgia,serif"><em>The Management</em></span></p>`
      $scope.options = {
        toolbar: [
          {
            name: 'clipboard',
            items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']
          },
          {name: 'styles', items: ['Format', 'Font', 'FontSize']},
          {
            name: 'basicstyles',
            items: ['Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat', 'CopyFormatting']
          },
          {name: 'colors', items: ['TextColor', 'BGColor']},
          {
            name: 'align',
            items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', 'Outdent', 'Indent']
          },
          /*{ name: 'links', items: [ 'Link', 'Unlink' ] },
           { name: 'insert', items: [ 'Image', 'Table' ] },*/
          {name: 'links', items: ['Link', 'Unlink', 'Image', 'Table']},
          {name: 'document', items: ['Source']},
          /*{ name: 'tools', items: [ 'Maximize' ] },
           { name: 'editing', items: [ 'Scayt' ] }*/
        ],
        font_names: 'Helvetica Neue;Microsoft YaHei;Arial/Arial, Helvetica, sans-serif;Times New Roman/Times New Roman, Times, serif;Verdana',
        // Since we define all configuration options here, let's instruct CKEditor to not load config.js which it does by default.
        // One HTTP request less will result in a faster startup time.
        // For more information check http://docs.ckeditor.com/#!/api/CKEDITOR.config-cfg-customConfig
        customConfig: '',
        // Sometimes applications that convert HTML to PDF prefer setting image width through attributes instead of CSS styles.
        // For more information check:
        //  - About Advanced Content Filter: http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
        //  - About Disallowed Content: http://docs.ckeditor.com/#!/guide/dev_disallowed_content
        //  - About Allowed Content: http://docs.ckeditor.com/#!/guide/dev_allowed_content_rules
        disallowedContent: 'img{width,height,float}',
        extraAllowedContent: 'img[width,height,align]',
        // Enabling extra plugins, available in the full-all preset: http://ckeditor.com/presets-all
        //extraPlugins: 'tableresize,uploadimage',
        /*********************** File management support ***********************/
        // In order to turn on support for file uploads, CKEditor has to be configured to use some server side
        // solution with file upload/management capabilities, like for example CKFinder.
        // For more information see http://docs.ckeditor.com/#!/guide/dev_ckfinder_integration
        // Uncomment and correct these lines after you setup your local CKFinder instance.
        // filebrowserBrowseUrl: 'http://example.com/ckfinder/ckfinder.html',
        // filebrowserUploadUrl: 'http://example.com/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files',
        //filebrowserImageUploadUrl: '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images',
        /*********************** File management support ***********************/
        // Make the editing area bigger than default.
        height: 440,
        // An array of stylesheets to style the WYSIWYG area.
        // Note: it is recommended to keep your own styles in a separate file in order to make future updates painless.
        contentsCss: ['/vendor/ckeditor/contents.css'],
        // This is optional, but will let us define multiple different styles for multiple editors using the same CSS file.
        bodyClass: 'document-editor',
        // Reduce the list of block elements listed in the Format dropdown to the most commonly used.
        format_tags: 'p;h1;h2;h3;pre',
        // Simplify the Image and Link dialog windows. The "Advanced" tab is not needed in most cases.
        removeDialogTabs: 'image:advanced;link:advanced',
        // Define the list of styles which should be available in the Styles dropdown list.
        // If the "class" attribute is used to style an element, make sure to define the style for the class in "mystyles.css"
        // (and on your website so that it rendered in the same way).
        // Note: by default CKEditor looks for styles.js file. Defining stylesSet inline (as below) stops CKEditor from loading
        // that file, which means one HTTP request less (and a faster startup).
        // For more information see http://docs.ckeditor.com/#!/guide/dev_styles
        stylesSet: [
          /* Inline Styles */
          {name: 'Marker', element: 'span', attributes: {'class': 'marker'}},
          {name: 'Cited Work', element: 'cite'},
          {name: 'Inline Quotation', element: 'q'},
          /* Object Styles */
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
      $scope.appender = (ev, doc) => {
        if ($scope.refreshing) {return}
        if (doc) {
          $scope.refreshing = true
          return $scope.ajax('detail', {doc_id: doc.doc_id}).then(data => {
            if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
              $scope.doc = data.doc_info
              !$scope.doc.doc_id && ($scope.doc.doc_id = doc.doc_id)
              $scope.mode = 1
            } else {
              $rootScope.alert(data.msg)
              $scope.mode = 0
            }
          }).finally(() => {$scope.refreshing = false})
        } else {
          $scope.doc = {
            doc_id: '',
            doc_name: '',
            doc_content: ''
          }
          $scope.mode = 1
        }
      }
      $scope.cancel = () => {
        $scope.mode = 0
      }

      $scope.kickoff = $q.when()
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
          $scope.cancel()
        }
      }
      $scope.$on('$destroy', event => {
        $rootScope.globalBack = null
      })
    }]
})
