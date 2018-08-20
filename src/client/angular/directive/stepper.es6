(function (angular) {
  'use strict'
  angular.module('rop.module.stepper', []).directive('ropStepper', ['$parse', '$timeout', ($parse, $timeout) => ({
    restrict: 'AE',

    scope: {
      index: '=index',
      steps: '=steps'
    },
    replace: true,
    templateUrl: '/_template/stepper',
    link ($scope, element, attrs) {
    }
  })])
})(window.angular)
