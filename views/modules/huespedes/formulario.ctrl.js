(function() {
  'use strict';
  /*global angular*/

  angular
    .module('csc')
    .controller('formulario.ctrl', Controller);

  Controller.$inject = ['$rootScope','$http','toastr','$state'];

  function Controller($rootScope, $http, toastr, $state) {
    $rootScope.nombre = "Informacion";
    var vm = this;
    
    /////////////////////////////////////////
  }
})();