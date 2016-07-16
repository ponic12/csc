(function() {
    'use strict';

    angular
        .module('csc')
        .controller('contactos.ctrl', Controller);

    Controller.$inject = ['$rootScope'];

    function Controller($rootScope) {
    $rootScope.nombre = "Contactos";
    var vm = this;

    }
})();