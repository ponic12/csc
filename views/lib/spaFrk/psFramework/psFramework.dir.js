/*global angular*/
(function() {
  'use strict';

  angular
    .module('psFramework')
    .directive('psFramework', function() {
      return {
        transclude: true,
        scope: {
          title: '@',
          subtitle: '@',
          iconFile: '@'
        },
        controller: "psFramework.ctrl",
        templateUrl: "lib/spaFrk/psFramework/psFrameworkTemplate"
      };
    });

})();
