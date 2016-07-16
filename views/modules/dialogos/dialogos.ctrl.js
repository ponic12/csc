(function() {
    'use strict';

    angular
        .module('csc')
        .controller('dialogos.ctrl', Controller);

    Controller.$inject = ['$rootScope'];

    function Controller($rootScope) {
    $rootScope.nombre = "Dialogos";
    var vm = this;

    }
})();