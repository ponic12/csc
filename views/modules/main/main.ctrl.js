(function() {
  'use strict';

  angular
    .module('csc')
    .controller('main.ctrl', Controller);

  Controller.$inject = ['$rootScope', '$state'];

  function Controller($rootScope, $state) {
    var vm = this;
    $rootScope.nombre = "Modulos";
  };
})();
