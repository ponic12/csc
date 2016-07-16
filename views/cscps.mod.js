/*global angular*/
(function() {
  'use strict';
  angular
    .module('cscps', ['psFramework'])
    .config(function($provide){
      $provide.decorator('$exceptionHandler',['$delegate',function($delegate){
        return function(exception, cause){
          $delegate(exception, cause);
          alert(exception.message);
        }
      }]);
    });
})();
