/**
 * Created by robin on 22/11/2016.
 */
define(['clipboard', 'treeview', 'packagetree', 'string2json', '../../services'], function (Clipboard) {
  'use strict'
  return ['$rootScope', '$scope', '$http', '$filter', '$q', '$cookies', '$stateParams', '$mdSidenav', '$mdDialog', '$timeout', '$state',
    ($rootScope, $scope, $http, $filter, $q, $cookies, $stateParams, $mdSidenav, $mdDialog, $timeout, $state) => {
      let api_id = $stateParams.id,
        cat_id = $stateParams.cat_id,
        cat_name = $stateParams.cat_name,
        token = $q.defer(), $parent = $scope.$parent,
        cliperParam = {}
      if (window.ssv_info.cat_id) {
        $scope.apiDetailQ(api_id, (window.ssv_info && window.ssv_info.cat_id)).then(() => {
          $timeout(() => {
            var activeElement = document.querySelector('body .document .section-wrapper section md-sidenav.md-sidenav-left.collapsed .md-expand>md-content md-list-item.active')
            activeElement && (activeElement.scrollIntoViewIfNeeded())
          }, 500)
          $scope.copyToClipboard = details => {
            let id = details.api_id ? details.api_id : details.domain_id,
              method = details.api_id ? 'ApiMethod' : 'ApiDomain'
            return `${Constant.protocol}://${Constant.host}/api/${method}-${id}.html`
          }
        })
        delete window.ssv_info.cat_id
        delete window.ssv_info.cat_name
      } else {
        $timeout(() => {
          $scope.apiDetailQ(api_id, (window.ssv_info && window.ssv_info.cat_id)).then(() => {
            $timeout(() => {
              var activeElement = document.querySelector('body .document .section-wrapper section md-sidenav.md-sidenav-left.collapsed .md-expand>md-content md-list-item.active')
              activeElement && (activeElement.scrollIntoViewIfNeeded())
            }, 500)
            $scope.copyToClipboard = details => {
              let id = details.api_id ? details.api_id : details.domain_id,
                method = details.api_id ? 'ApiMethod' : 'ApiDomain'
              return `${Constant.protocol}://${Constant.host}/api/${method}-${id}.html`
            }
          })
        }, 100)
      }

      $scope.initClipboard(cliperParam)

      let cliper = new Clipboard('.cliper'), copying = false
      cliper.on('success', e => {
        if ($scope.clipboardHints == cliperParam.beforeClipboardCopy) {
          e.clearSelection()
          $timeout(() => {
            $scope.clipboardHints = cliperParam.afterClipboardCopy
          })
          $timeout(() => {
            $scope.clipboardHints = cliperParam.beforeClipboardCopy
          }, 3000)
        }
      })

      cliper.on('error', e => {
        if ($scope.clipboardHints == cliperParam.beforeClipboardCopy) {
          $timeout(() => {
            $scope.clipboardHints = cliperParam.workaroundSupportClipboard(e.action)
          })
          $timeout(() => {
            $scope.clipboardHints = cliperParam.beforeClipboardCopy
          }, 3000)
        }
      })

      window.test1 = $scope
      $scope.$on('$destroy', function () {
        cliper && cliper.destroy()
        if (($state.current.name != 'document.api') && ($state.current.name != 'document.domain')) {$scope.reset()}
      })
    }]
})
