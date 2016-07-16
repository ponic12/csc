/*global angular*/
(function() {
  'use strict';

  angular
    .module('psMenu')
    .directive('psMenuItem', function() {
      return {
        require: '^psMenu',
        scope: {
          label: '@',
          icon: '@',
          route: '@'
        },
        templateUrl: "lib/spaFrk/psMenu/psMenuItemTemplate",
        link: function(scope, elem, attrs, ctrl) {
          elem.on('click', function(evt) {

            scope.isActive = function() {
              return elem === ctrl.getActiveElement();
            }
            
            scope.isVertical = function(){
              return (ctrl.isVertical());
            }

            evt.stopPropagation();
            evt.preventDefault();

            scope.$apply(function() {
              ctrl.setActiveElement(elem);
              ctrl.setRoute(scope.route);
            })
          })
        }
      };
    });

})();
