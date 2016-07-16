(function() {
  'use strict';
  /*global angular*/

  angular
    .module('csc')
    .controller('huespedes.ctrl', Controller);

  Controller.$inject = ['$rootScope','$http','toastr','$state'];

  function Controller($rootScope, $http, toastr, $state) {
    $rootScope.nombre = "Huespedes";
    var vm = this;
    vm.dataHuespedes;
    vm.goto = goto;
    
    loadHuespedes();
    /////////////////////////////////////////
    function loadHuespedes(){
      $http({
        method: 'get',
        url: '/huesped/getFormVigentes'
      }).then(function successCallback(response) {
        vm.dataHuespedes = response.data;
      }, function errorCallback(response) {
        toastr.error('Ha ocurrido un error trayendo los huespedes', 'Error');
      });
    }
    
    
    function goto(obj) {
      $state.go('formulario', {'id': obj.id});    
    }
  }
})();