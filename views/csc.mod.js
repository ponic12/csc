var csc = {
  version: '1.0',
  history: []
};

/*global angular*/
/*global io*/
/*global moment*/

//Agrego al prototipo de String, un metodo que sirve para hashear.
String.prototype.hashCode = function() {
  var hash = 0,
    i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function reloadSEGAT() {
  var pathName = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
  if (!location.origin) {
    location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : '');
  }
  var endpoint = location.origin + pathName + '/';
  window.location.assign(endpoint);
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getWatchers(root) {
  root = angular.element(root || document.documentElement);

  function getElemWatchers(element) {
    var isolateWatchers = getWatchersFromScope(element.data().$isolateScope);
    var scopeWatchers = getWatchersFromScope(element.data().$scope);
    var watchers = scopeWatchers.concat(isolateWatchers);
    angular.forEach(element.children(), function(childElement) {
      watchers = watchers.concat(getElemWatchers(angular.element(childElement)));
    });
    return watchers;
  }

  function getWatchersFromScope(scope) {
    if (scope) {
      return scope.$$watchers || [];
    }
    else {
      return [];
    }
  }

  return getElemWatchers(root);
}

function formatDate(dateVal) {
  console.log('calling formatDate(date)');
  var x = moment(dateVal).format("DD/MM/YY HH:mm");
  return x;
}

function test(){
  console.log('TEST Hola');
}

(function() {
  'use strict';
  angular
    .module('csc', ['fwk', 'ngAnimate', 'ui.bootstrap', 'ui.router', 'toastr', 'HoldButton'])
    .config(Config)
    .config(ConfigToastrContainer)
    .config(ConfigToastrPanel)
    .factory('popupSrv', function($uibModal, $q, $rootScope) {
      return {
        alert: showAlert,
        confirm: showConfirm,
        template: showTemplate
      }

      function showAlert(message, title) {
        var customTitle = "AVISO";
        if (title) customTitle = title;
        var params = {
          title: customTitle,
          message: message,
          cancelFlag: false
        };
        return showModal(params);
      }

      function showConfirm(message, title) {
        var customTitle = "CONFIRMACI�N";
        if (title) customTitle = title;
        var params = {
          title: customTitle,
          message: message,
          cancelFlag: true
        };
        return showModal(params);
      }

      function showTemplate(url, payload, title) {
        var customTitle = "";
        if (title) customTitle = title;
        var params = {
          title: customTitle,
          url: url,
          payload: payload,
          cancelFlag: true
        };
        return showModal(params);
      }

      function showModal(p) {
        var pro = $q(function(resolve, reject) {
          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'popupFrame.html',
            controller: 'popupFrame.ctrl',
            resolve: {
              params: p
            }
          });
          modalInstance.result.then(
            function(objOk) {
              console.log(objOk);
              resolve(objOk);
            },
            function(objCancel) {
              console.log(objCancel);
              reject(objCancel);
            }
          );
        });
        return pro;
      }
    })
    .service("evtSrv", function($rootScope) {
      this.broadcast = function(evtName, payload) {
        $rootScope.$broadcast(evtName, payload)
      };
      this.listen = function(evtName, callback, scope) {
        var sc = $rootScope;
        if (scope) sc = scope;
        sc.$on(evtName, function(event, payload) {
          callback(payload);
        });
      };
    })
    .factory('sio', SIO)
    .controller('popupFrame.ctrl', [
      '$scope',
      '$rootScope',
      '$uibModalInstance',
      'params',
      'evtSrv',
      function($scope, $rootScope, $uibModalInstance, params, evtSrv, $location) {

        var flag = true;
        if (params.cancelFlag != undefined)
          flag = params.cancelFlag

        $scope.isTemplate = (params.url != undefined);
        $scope.title = params.title;
        $scope.customTemplateUrl = params.url;
        $scope.message = params.message;
        $scope.cancelFlag = flag;
        $scope.okFlag = true;

        $scope.payload = params.payload;

        $scope.ok = function() {
          if ($scope.isTemplate)
            evtSrv.broadcast('okEvt');
          else
            $uibModalInstance.close();
        };
        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };

        evtSrv.listen('validationOkEvt', function(payload) {
          $uibModalInstance.close(payload);
          //$rootScope.$$listeners['okEvt'] = [];
        }, $scope);

        evtSrv.listen('$locationChangeSuccess', function() {
          $scope.cancel();
        });
      }
    ]);


  Config.$inject = [
    '$urlRouterProvider',
    '$stateProvider'
  ];

  function Config($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/home'); // default route
    // function Config($stateProvider) {

    $stateProvider.
    state('main', {
      url: '/main',
      templateUrl: 'modules/main/main.ejs'
    }).
    state('login', {
      url: '/login',
      templateUrl: 'modules/login/login.ejs'
    }).
    state('agenda', {
      url: '/agenda',
      templateUrl: 'modules/agenda/agenda.ejs'
    }).
    state('bitacoras', {
      url: '/bitacoras',
      templateUrl: 'modules/bitacoras/bitacoras.ejs'
    }).
    state('bitacoraDetalle', {
      url: '/bitacoraDetalle/:id',
      templateUrl: 'modules/bitacoras/bitacoraDetalle.ejs'
    }).
    state('dialogos', {
      url: '/dialogos',
      templateUrl: 'modules/dialogos/dialogos.ejs'
    }).
    state('configuracion', {
      url: '/configuracion',
      templateUrl: 'modules/configuracion/configuracion.ejs'
    }).
    state('huespedes', {
      url: '/huespedes',
      templateUrl: 'modules/huespedes/huespedes.ejs'
    }).
    state('contactos', {
      url: '/contactos',
      templateUrl: 'modules/contactos/contactos.ejs'
    });
  }

  function ConfigToastrContainer(toastrConfig) {
    angular.extend(toastrConfig, {
      autoDismiss: false,
      containerId: 'toast-container',
      maxOpened: 0,
      newestOnTop: true,
      positionClass: 'toast-top',
      preventDuplicates: false,
      preventOpenDuplicates: false,
      target: 'body'
    });
  }

  function ConfigToastrPanel(toastrConfig) {
    angular.extend(toastrConfig, {
      allowHtml: false,
      closeButton: false,
      closeHtml: '<button>&times;</button>',
      extendedTimeOut: 1000,
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning'
      },
      messageClass: 'toast-message',
      onHidden: null,
      onShown: null,
      onTap: null,
      progressBar: false,
      tapToDismiss: true,
      templates: {
        toast: 'directives/toast/toast.html',
        progressbar: 'directives/progressbar/progressbar.html'
      },
      timeOut: 5000,
      titleClass: 'toast-title',
      toastClass: 'toast'
    });
  }

  function SIO($rootScope) {
    var socket = io.connect();
    return {
      on: function(eventName, callback) {
        socket.on(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        socket.emit(eventName, data, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            if (callback)
              callback.apply(socket, args);
          });
        })
      }
    }
  };
})();
