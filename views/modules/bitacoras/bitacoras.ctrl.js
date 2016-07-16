(function() {
  'use strict';
  /*global angular*/
  angular
    .module('csc')
    .controller('bitacoras.ctrl', Controller);

  Controller.$inject = ['$http', '$rootScope', 'popupSrv', '$state', 'toastr'];

  function Controller($http, $rootScope, popupSrv, $state, toastr) {
    $rootScope.nombre = "Bitacoras";
    var vm = this;
    vm.selBitacora = {nombre:"", color:"#888", editMode:false};
    vm.disableAdd = false;
    vm.dataBitacoras = [];
    vm.formatFecha = formatFecha;
    vm.setColor = setColor;
    vm.goto = goto;
    vm.create = create;
    vm.edit = edit;
    vm.destroy = destroy;
    vm.save = save;

    loadBitacoras();
    ////////////////////////////////////////
    function create() {
      vm.selBitacora = {};
      vm.selBitacora.nombre = "";
      vm.selBitacora.color = "#888";
      vm.selBitacora.editMode = true;
      vm.dataBitacoras.push(vm.selBitacora);
      vm.disableAdd = true;
    }

    function edit($event, $promise, bit) {
        // validar que no se este en modo edicion en otra bitacora 
        // si esta en edicion una bitacora nueva se elimina
        // si esta en edicion una bitacora vieja se saca de edicion 

      $promise.then(function(success) {
        resetFolders();
        bit.editMode = true;
        vm.selBitacora = bit;
      }, function(reason) {
        //Called if the promise is rejected, ie the button is not hold long enough
      }, function(update) {
        //This is the progress function, called multiple times before the promise is 
        // either resolved or rejected.
      });
    }

    function destroy(bit) {
      popupSrv.confirm('¿Seguro desea eliminar esta bitacora?', 'Alerta').then(function(res) {
        if (res != "cancel") {
          if (bit.id){
            $http.delete('/bitacora/' + bit.id).then(
              function(response) {
                removeBitacora(bit);
              },
              function errorCallback(response) {
                toastr.error('Ha ocurrido un error borrando la bitacora', 'Error');
              }
            );
          }
          else{
            removeBitacora(bit);
          }
        }
        
        function removeBitacora(item){
          var pos = vm.dataBitacoras.indexOf(item);
          vm.dataBitacoras.splice(pos, 1);
          vm.disableAdd = false;
        }
      });
    }

    function save(bit) {
      var params = {
        nombre: vm.selBitacora.nombre,
        color: vm.selBitacora.color.substr(1, vm.selBitacora.color.length-1),
        usuario: "PP"
      };
      bit.color = params.color;
      bit.editMode = false;
      vm.disableAdd = false;
      
      if (bit.id) { // Update
        $http.put('/bitacora/' + bit.id, params).then(
          function successCallback(response) {
            bit.updateAt = response.updateAt;
            toastr.info('Se grabo con exito la bitacora', 'Informacion');
          },
          function errorCallback(response) {
            toastr.error('Ha ocurrido un error grabando la bitacora', 'Error');
          }
        );
      }
      else { // Create
        $http.post('/bitacora', params).then(
          function successCallback(response) {
            bit.updateAt = response.updateAt;
            toastr.success('Se creo con exito la bitacora', 'Informacion');
          },
          function errorCallback(response) {
            toastr.error('Ha ocurrido un error creando la bitacora', 'Error');
          }
        );
      }
    };
    
    function loadBitacoras() {
      $http({
        method: 'get',
        url: '/bitacora/get'
      }).then(function successCallback(response) {
        //vm.dataBitacoras = JSON.parse('['+response.data.join(',')+']');
        vm.dataBitacoras = response.data;
      }, function errorCallback(response) {
        toastr.error('Ha ocurrido un error trayendo las bitacoras', 'Error');
      });
    }

    function setColor(bit) {
      var res = {'background': 'radial-gradient(at top left, #BBBBBB, #888)'};
      if (bit.color){
        res = {'background': 'radial-gradient(at top left, #BBBBBB,#' + bit.color + ')'};
      }
      return res;
    }

    function goto(bit) {
      if (bit.editMode != true) {
        console.log('Detalle bitacora:' + bit.nombre);
        $state.go('bitacoraDetalle', {'id': bit.id, 'bitacora':bit.nombre});
      }
    }

    function resetFolders() {
      for (var i = 0; i < vm.dataBitacoras.length; i++) {
        var bit = vm.dataBitacoras[i];
        if (bit.editMode == true){
          if (bit.id == undefined) // nuevo elemento 
            vm.dataBitacoras.splice(i, 1);
          else 
            bit.editMode = false;
        }
      }
    }
    
    function formatFecha(d){
      return formatDate(d);
    }
  }
})();