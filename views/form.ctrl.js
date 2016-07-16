(function() {
   'use strict';
   /*global angular*/
   /*global framework*/
   /*global userinfo*/
   angular
      .module('form.app')
      .controller('form.ctrl', Controller);

   Controller.$inject = ['$rootScope', '$state', '$http', '$timeout', '$locale', 'toastr'];

   function Controller($rootScope, $state, $http, $timeout, $locale, toastr) {

      var vm = this;
      vm.title = "Complejo San Clemente";
      vm.email;
      vm.data = {};
      vm.flags = {
         loading: false,
         isLogged: false
      };
      vm.signin = signin;
      vm.save = save;

      var locales = setLocales();
      initFechas();
      ////////////////////////////////////////////////////////////

      function signin() {
         vm.flags.loading = true;
         $http.get('/form/signin?email=' + vm.email)
            .then(function onSuccess(res) {
               toastr.info('Bienvenido a Complejo San Clemente', 'Aviso');
               if (!res.firstName)
                  toastr.warning('Este correo no esta registrado, se procedera a generar un nuevo formulario.', 'Aviso');
               vm.data = res.data;
               console.log(res);
            })
            .catch(function onError(sailsResponse) {
               console.log(sailsResponse);
            })
            .finally(function eitherway() {
               vm.flags.isLogged = true;
               vm.flags.loading = false;
            });
      }

      function save() {
         vm.flags.loading = true;
         var params = {};
         $http.put('/form/save', params)
            .then(function onSuccess(sailsResponse) {


               console.log(sailsResponse);
            })
            .catch(function onError(sailsResponse) {
               var newUserFlag = (sailsResponse.status == 409);
               if (newUserFlag) {
                  toastr.warning('Este correo no esta registrado, se procedera a generar un nuevo formulario.', 'Aviso');
                  return;
               }
            })
            .finally(function eitherway() {
               vm.flags.isLogged = true;
               vm.flags.loading = false;
            });

      }
      
      function setLocales() {
         return {
                es: {
                    "DATETIME_FORMATS": {
                        "AMPMS": [
                          "a.m.",
                          "p.m."
                        ],
                        "DAY": [
                          "domingo",
                          "lunes",
                          "martes",
                          "mi\u00e9rcoles",
                          "jueves",
                          "viernes",
                          "s\u00e1bado"
                        ],
                        "MONTH": [
                          "enero",
                          "febrero",
                          "marzo",
                          "abril",
                          "mayo",
                          "junio",
                          "julio",
                          "agosto",
                          "septiembre",
                          "octubre",
                          "noviembre",
                          "diciembre"
                        ],
                        "SHORTDAY": [
                          "dom",
                          "lun",
                          "mar",
                          "mi\u00e9",
                          "jue",
                          "vie",
                          "s\u00e1b"
                        ],
                        "SHORTMONTH": [
                          "ene",
                          "feb",
                          "mar",
                          "abr",
                          "may",
                          "jun",
                          "jul",
                          "ago",
                          "sep",
                          "oct",
                          "nov",
                          "dic"
                        ],
                        "fullDate": "EEEE, d 'de' MMMM 'de' y",
                        "longDate": "d 'de' MMMM 'de' y",
                        "medium": "dd/MM/yyyy HH:mm:ss",
                        "mediumDate": "dd/MM/yyyy",
                        "mediumTime": "HH:mm:ss",
                        "short": "dd/MM/yy HH:mm",
                        "shortDate": "dd/MM/yy",
                        "shortTime": "HH:mm"
                    },
                    "NUMBER_FORMATS": {
                        "CURRENCY_SYM": "\u20ac",
                        "DECIMAL_SEP": ",",
                        "GROUP_SEP": ".",
                        "PATTERNS": [
                          {
                              "gSize": 3,
                              "lgSize": 3,
                              "macFrac": 0,
                              "maxFrac": 3,
                              "minFrac": 0,
                              "minInt": 1,
                              "negPre": "-",
                              "negSuf": "",
                              "posPre": "",
                              "posSuf": ""
                          },
                          {
                              "gSize": 3,
                              "lgSize": 3,
                              "macFrac": 0,
                              "maxFrac": 2,
                              "minFrac": 2,
                              "minInt": 1,
                              "negPre": "-",
                              "negSuf": "\u00a0\u00a4",
                              "posPre": "",
                              "posSuf": "\u00a0\u00a4"
                          }
                        ]
                    },
                    "id": "es-es",
                    "pluralCat": function (n) { if (n == 1) { return PLURAL_CATEGORY.ONE; } return PLURAL_CATEGORY.OTHER; }
                }
            }
      };
      
      function initFechas() {
         vm.dt = new Date();
         // initializes $locale with french locale
         angular.copy(locales['es'], $locale);

         // popup opening
         vm.open = function () {
             $timeout(function () {
                 vm.opened = true;
             });
         };

         // locale change
         vm.setLang = function (lang) {
             // droddown closed
             vm.status.isopen = false;
             // changes $locale
             angular.copy(locales[lang], $locale);
             // changes dt to apply the $locale changes
             vm.dt = new Date(vm.dt.getTime());
         };
        }

   }
})();