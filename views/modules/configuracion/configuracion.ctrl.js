(function() {
  'use strict';

  angular
    .module('csc')
    .controller('configuracion.ctrl', Controller);

  Controller.$inject = ['$rootScope'];

  function Controller($rootScope) {
    $rootScope.nombre = "Configuracion";
    var vm = this;
  }
})();