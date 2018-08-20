(function (angular) {
  'use strict'
  let model = angular.module('rop.module.WYSIWYGEditor', [])

  model.directive('ropWYSIWYGEditor', editorDirective)

  // 如果是rangeCalendar的话，"0"表示是开始日期，"1"表示是结束日期
  function editorDirective () {
    return {
      restrict: 'A',
      require: ['ngModel', 'ropWYSIWYGEditor'],
      controller: EditorCtrl,
      controllerAs: 'ctrl',
      bindToController: true,
      link: function (scope, element, attrs, controllers) {
        // get needed controllers
        var ngModelCtrl = controllers[0], editorCtrl = controllers[1]
        editorCtrl.configureNgModel(ngModelCtrl, attrs)
      }
    }
  }

  function EditorCtrl ($element, $attrs, $scope, $animate, $q, $mdInkRipple, $mdUtil, $timeout) {
    this.$animate = $animate
    this.$q = $q
    this.$mdInkRipple = $mdInkRipple
    this.$mdUtil = $mdUtil
    this.$element = $element
    this.$scope = $scope
    this.$timeout = $timeout

    this.ngModelCtrl = null
    this.config = $parse($attrs.ckeditor)($scope) || {}
    this.readyDeferred = $q.defer()
    var self = this

    this.instance = CKEDITOR.replace(this.$element[0], config)
    this.instance.on('instanceReady', () => {
      self.readyDeferred.resolve(true)
    })
    this.ready = () => self.readyDeferred.promise

    $scope.$on('$destroy', function onDestroy () {
      self.readyDeferred.promise.then(function () {
        self.instance.destroy(false)
      })
    })
  }

  EditorCtrl.$inject = ['$element', '$attrs', '$scope', '$animate', '$q', '$mdConstant', '$mdTheming', '$$mdDateUtil', '$mdDateLocale', '$mdInkRipple', '$mdUtil', '$timeout']
  EditorCtrl.prototype.configureNgModel = function (ngModelCtrl, attrs) {
    this.ngModelCtrl = ngModelCtrl
    var self = this

    // Initialize the editor content when it is ready.
    self.ready().then(function initialize () {
      // Sync view on specific events.
      ['dataReady', 'change', 'blur', 'saveSnapshot'].forEach(function (event) {
        self.onCKEvent(event, () => {
          self.ngModelCtrl.$setViewValue(self.instance.getData() || '')
        })
      });
      ['dataReady', 'change', 'blur', 'saveSnapshot'].forEach(function (event) {
        self.instance.on(event, () => {
          self.ngModelCtrl.$setViewValue(self.instance.getData() || '')
          //self.ngModelCtrl.$render();
        })
      })
    })

    // Set editor data when view data change.
    ngModelCtrl.$render = function syncEditor () {
      self.ready().then(function () {
        // "noSnapshot" prevent recording an undo snapshot
        self.instance.setData(ngModelCtrl.$viewValue || '', {
          noSnapshot: true,
          callback: function () {
            // Amends the top of the undo stack with the current DOM changes
            // ie: merge snapshot with the first empty one
            // http://docs.ckeditor.com/#!/api/CKEDITOR.editor-event-updateSnapshot
            self.instance.fire('updateSnapshot')
          }
        })
      })
    }
  }
})(window.angular)
