/*global angular*/
/*global Config*/

(function() {
  'use strict';
  angular
    .module('form.app', ['fwk', 'ngAnimate', 'ui.bootstrap', 'ui.router', 'toastr'])
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
})();
