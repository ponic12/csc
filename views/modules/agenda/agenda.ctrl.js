(function() {
    'use strict';

    angular
        .module('csc')
        .controller('agenda.ctrl', Controller);

    Controller.$inject = ['$rootScope'];

    function Controller($rootScope) {
        $rootScope.nombre = "Agenda";
        var vm = this;

    }
})();