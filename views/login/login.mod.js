/*global angular*/
(function() {
  'use strict';

  angular
    .module('loginModule', ['fwk','ngAnimate', 'toastr'])
    .config(ConfigToastrContainer)
    .directive('compareTo', CompareTo);



  function ConfigToastrContainer(toastrConfig) {
    angular.extend(toastrConfig, {
      autoDismiss: false,
      containerId: 'toast-container',
      maxOpened: 0,
      newestOnTop: true,
      positionClass: 'toast-top',
      preventDuplicates: false,
      preventOpenDuplicates: false,
      target: 'body'
    });
  }
  function CompareTo() {
    return {
      require: 'ngModel',
      scope: {
        otherModelValue: '=compareTo'
      },
      link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch('otherModelValue', function() {
          ngModel.$validate();
        });
      }
    }
  };
})();
