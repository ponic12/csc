/*global angular*/
(function() {
  'use strict';

  angular
    .module('psMenu')
    .directive('psMenu', function() {
      return {
        transclude:true,
        scope: {
        }, 
        controller:"psMenu.ctrl",
        templateUrl: "lib/spaFrk/psMenu/psMenuTemplate",
        link:function(scope, elem, attrs){
          
        }
      };
    });

})();
