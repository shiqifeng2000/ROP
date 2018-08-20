/*
 angular
 .module('ckeditor', [])
 .directive('ckeditor', ['$parse', ckeditorDirective]);

 // Polyfill setImmediate function.
 var setImmediate = window && window.setImmediate ? window.setImmediate : function (fn) {
 setTimeout(fn, 0);
 };

 /!**
 * CKEditor directive.
 *
 * @example
 * <div ckeditor="options" ng-model="content" ready="onReady()"></div>
 *!/

 function ckeditorDirective($parse) {
 return {
 restrict: 'A',
 require: ['ckeditor', 'ngModel'],
 controller: [
 '$scope',
 '$element',
 '$attrs',
 '$parse',
 '$q',
 ckeditorController
 ],
 link: function (scope, element, attrs, ctrls) {
 // get needed controllers
 var controller = ctrls[0]; // our own, see below
 var ngModelController = ctrls[1];

 // Initialize the editor content when it is ready.
 controller.ready().then(function initialize() {
 // Sync view on specific events.
 ['dataReady', 'change', 'blur', 'saveSnapshot'].forEach(function (event) {
 controller.onCKEvent(event, function syncView() {
 ngModelController.$setViewValue(controller.instance.getData() || '');
 });
 });

 controller.instance.setReadOnly(!! attrs.readonly);
 attrs.$observe('readonly', function (readonly) {
 controller.instance.setReadOnly(!! readonly);
 });

 // Defer the ready handler calling to ensure that the editor is
 // completely ready and populated with data.
 setImmediate(function () {
 $parse(attrs.ready)(scope);
 });
 });

 // Set editor data when view data change.
 ngModelController.$render = function syncEditor() {
 controller.ready().then(function () {
 // "noSnapshot" prevent recording an undo snapshot
 controller.instance.setData(ngModelController.$viewValue || '', {
 noSnapshot: true,
 callback: function () {
 // Amends the top of the undo stack with the current DOM changes
 // ie: merge snapshot with the first empty one
 // http://docs.ckeditor.com/#!/api/CKEDITOR.editor-event-updateSnapshot
 controller.instance.fire('updateSnapshot');
 }
 });
 });
 };
 }
 };
 }

 /!**
 * CKEditor controller.
 *!/

 function ckeditorController($scope, $element, $attrs, $parse, $q) {
 var config = $parse($attrs.ckeditor)($scope) || {};
 var editorElement = $element[0];
 var instance;
 var readyDeferred = $q.defer(); // a deferred to be resolved when the editor is ready

 // Create editor instance.
 if (editorElement.hasAttribute('contenteditable') &&
 editorElement.getAttribute('contenteditable').toLowerCase() == 'true') {
 instance = this.instance = CKEDITOR.inline(editorElement, config);
 }
 else {
 instance = this.instance = CKEDITOR.replace(editorElement, config);
 }

 /!**
 * Listen on events of a given type.
 * This make all event asynchronous and wrapped in $scope.$apply.
 *
 * @param {String} event
 * @param {Function} listener
 * @returns {Function} Deregistration function for this listener.
 *!/

 this.onCKEvent = function (event, listener) {
 instance.on(event, asyncListener);

 function asyncListener() {
 var args = arguments;
 setImmediate(function () {
 applyListener.apply(null, args);
 });
 }

 function applyListener() {
 var args = arguments;
 $scope.$apply(function () {
 listener.apply(null, args);
 });
 }

 // Return the deregistration function
 return function $off() {
 instance.removeListener(event, applyListener);
 };
 };

 this.onCKEvent('instanceReady', function() {
 readyDeferred.resolve(true);
 });

 /!**
 * Check if the editor if ready.
 *
 * @returns {Promise}
 *!/
 this.ready = function ready() {
 return readyDeferred.promise;
 };

 // Destroy editor when the scope is destroyed.
 $scope.$on('$destroy', function onDestroy() {
 // do not delete too fast or pending events will throw errors
 readyDeferred.promise.then(function() {
 instance.destroy(false);
 });
 */
(function (angular) {
  'use strict'
  let model = angular.module('rop.module.editor', ['material.core'])
  model.directive('ropEditor', editorDirective)
  // 如果是rangeCalendar的话，"0"表示是开始日期，"1"表示是结束日期
  function editorDirective () {
    return {
      scope: {
        options: '='
      },
      require: ['ngModel', 'ropEditor'],
      controller: EditorCtrl,
      controllerAs: 'ctrl',
      bindToController: true,
      template: ``,
      link: function (scope, element, attrs, controllers) {
        // get needed controllers
        var ngModelCtrl = controllers[0], editorCtrl = controllers[1]
        editorCtrl.configureNgModel(ngModelCtrl)
      }
    }
  }

  function EditorCtrl ($scope, $element, $timeout, $animate, $q) {
    this.$animate = $animate
    this.$q = $q
    //this.$mdInkRipple = $mdInkRipple;
    this.$element = $element
    this.editorPanel = $element[0].querySelector('textarea')
    this.$scope = $scope
    this.$timeout = $timeout

    this.ngModelCtrl = null
    this.readyDeferred = $q.defer()
    var self = this
    this.ready = () => self.readyDeferred.promise
    if(this.$element.attr("id")){
      this.id = this.$element.attr("id")
    } else {
      var id = `rop_editor_${new Date().getTime()}`
      this.$element.attr("id", id)
      this.id = id
    }
    if(CKEDITOR.instances[this.id]){
      this.instance = CKEDITOR.instances[this.id]
    }

    $scope.$watch(() => self.options, (a) => {
      if (self.instance) {
        self.instance.destroy()
      }
      if(CKEDITOR.instances[self.id]){
        CKEDITOR.instances[self.id].destroy()
      }
      if(self.$element[0] && self.$element[0].hasAttribute('rop-editor')){
        self.$element.attr("contenteditable",true)
        self.instance = CKEDITOR.inline(self.$element[0], self.options)
      } else {
        self.instance = CKEDITOR.replace(self.$element[0], self.options)
      }
      //self.instance = CKEDITOR.instances[self.id]
      self.instance.on('instanceReady', () => {
        self.readyDeferred.resolve(true)
      })
    })
    $scope.$on('$destroy', function onDestroy () {
      var instance = CKEDITOR.instances[self.id]
      instance && instance.destroy()
      self.readyDeferred.promise.then(function () {
        instance && instance.destroy()
      })
    })
  }

  //EditorCtrl.$inject = ["$element", "$attrs", "$scope", "$animate", "$q", "$mdInkRipple", "$mdUtil","$timeout","$parse"];
  EditorCtrl.$inject = ['$scope', '$element', '$timeout', '$animate', '$q']
  EditorCtrl.prototype.configureNgModel = function (ngModelCtrl) {
    var self = this
    this.ngModelCtrl = ngModelCtrl

    // Initialize the editor content when it is ready.
    self.ready().then(function initialize () {
      // Sync view on specific events.
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
