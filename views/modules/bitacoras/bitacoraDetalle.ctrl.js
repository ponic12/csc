(function() {
  'use strict';
  /*global angular*/

  angular
    .module('csc')
    .controller('bitacoraDetalle.ctrl', Controller);

  Controller.$inject = ['$rootScope', 'popupSrv', '$http', '$stateParams', 'toastr'];

  function Controller($rootScope, popupSrv, $http, $stateParams, toastr) {
    $rootScope.nombre = $stateParams.bitacora;
    var vm = this;
    vm.dataHistory = [];
    vm.texto = '';
    vm.addMsg = addMsg;
    vm.formatFecha = formatFecha;
    vm.fullName = fullName;
    vm.setColor = setColor;
    
    loadBitacoraHistory($stateParams.id);
    ////////////////////////////////////////

    function loadBitacoraHistory(id) {
      $http({
        method: 'get',
        url: '/historia/getByIdBitacora/' + id
      }).then(function successCallback(response) {
        vm.dataHistory = response.data;
      }, function errorCallback(response) {
        toastr.error('Ha ocurrido un error trayendo el historial', 'Error');
      });
    }

    function addMsg() {
      var params = {
        texto: vm.msg,
        user: $rootScope.currentUser.id,
        owner: $stateParams.id
      };
      $http.post('historia', params).then(
        function successCb(response) {
          var info = response.data;
          var usr = {firstName: $rootScope.currentUser.firstName, lastName: $rootScope.currentUser.lastName};
          info.user = usr;
          vm.dataHistory.push(info);
        },
        function errorCb(response) {

        });
      vm.msg = "";
    }

    function formatFecha(d) {
      return formatDate(d);
    }
    function fullName(msg){
      var fn = msg.user.firstName + ' ' + msg.user.lastName;
      return fn;
    }
    function setColor(msg){
      var res = {'color': 'black'};
      if (msg.user.color){
        res = {'color': '#' + msg.user.color};
      }
      return res;
    }
  }
})();