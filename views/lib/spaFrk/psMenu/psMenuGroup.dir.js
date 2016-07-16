/*global angular*/
(function() {
  'use strict';

  angular
    .module('psMenu')
    .directive('psMenuGroup', function() {
      return {
        require: '^psMenu',
        transclude: true,
        scope: {
          label: '@',
          icon: '@'
        },
        controller: "psMenu.ctrl",
        templateUrl: "lib/spaFrk/psMenu/psMenuGroupTemplate",
        link: function(scope, elem, attrs, ctrl) {
          scope.isOpen = false;
          scope.closeMenu = function(){
            scope.isOpen = false;
          }
          scope.clicked = function(){
            scope.isOpen = !scope.isOpen;
          }
          scope.isVertical = function(){
            return ctrl.isVertical;
          }
        }
      };
    });

})();
