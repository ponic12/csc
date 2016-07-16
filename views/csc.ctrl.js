(function() {
  'use strict';
  /*global angular*/
  /*global framework*/
  /*global userinfo*/
  angular
    .module('csc')
    .controller('csc.ctrl', Controller);

  Controller.$inject = ['$rootScope', '$state', '$http', 'toastr'];

  function Controller($rootScope, $state, $http, toastr) {
    ///////////////////////
    $rootScope.currentUser = {
      id:userinfo.id,
      firstName: userinfo.firstName,
      lastName: userinfo.lastName,
      fullName: userinfo.firstName + ', ' + userinfo.lastName,
      email: userinfo.email
    };
    ///////////////////////
    
    var vm = this;
    $rootScope.flags = setFlags();
    $rootScope.alertsCounter = 0;
    vm.title = "Complejo San Clemente";
    vm.noSpin = noSpin;
    vm.showVersion = showVersion;
    vm.cerrarSesion = cerrarSesion;

    initLibrary();
    ////////////////////////////////////////////////////////////

    function initLibrary() {
      var opt = {
        storageConfig: {
          repository: 'CSC-STORAGE',
          defaultStore: 'Main'
        },
        logConfig: {
          pathEvents: 'SaveEvents',
          pathErrors: 'SaveErrors'
        }
      };
      framework.initialize(opt, onSuccess);
    };

    function onSuccess() {
      console.log("'framework.web' OK // " +
        "En contenedor: " + (framework.isInContainer() ? "SI" : "NO") + " // " +
        "Storage soportado: " + (framework.isStorageAvailable() ? "SI" : "NO") + " // " +
        "SAF soportado: " + (framework.services.canSAF() ? "SI" : "NO"));
      
      $state.go('main');
      // framework.storage.getFull('currentUser',
      //     function (data) {
      //         if ((data.value == null) || (data.value == '')) {
      //             $state.go('login')
      //         }
      //         else {
      //             console.log('currentUser:' + data.value.username);
      //             $rootScope.currentUser = data.value;
      //             framework.security.setUsername($rootScope.currentUser.username);

      //             restSrv.setHttpOptions($rootScope.currentUser.username, $rootScope.currentUser.acciones);
      //             //$state.go('inbox');
      //         }
      //     }
      // );
    }

    function setFlags() {
      var res = {
        'id': 0,
        'flagL': false,
        'search': false,
        'spin': false
      };
      return res;
    }

    function noSpin() {
      $rootScope.flags.spin = false;
    }

    function showVersion() {
      popupSrv.alert("Usuario: '" + $rootScope.currentUser.username + "'", "C.S.C v" + csc.version);
    };

    function cerrarSesion() {
      $rootScope.currentUser = null;
      framework.storage.set('currentUser', $rootScope.currentUser);
      console.log('LOGOUT: Save empty user to storage');
      framework.security.setUsername(null);
      //reloadSEGAT();
    };
  }
})();