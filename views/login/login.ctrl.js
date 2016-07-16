(function() {
   'use strict'; /*global angular*/
   angular
      .module('loginModule')
      .controller('login.ctrl', Controller);

   Controller.$inject = ['$http', 'toastr'];

   function Controller($http, toastr) {
      var vm = this;

      vm.flags = {
         enableLogin: true,
         loading: false
      };
      vm.signinForm = {
         email: undefined,
         password: undefined
      };
      vm.signupForm = {
         firstName: undefined,
         lastName: undefined,
         email: undefined,
         password: undefined
      };

      vm.signin = signin;
      vm.signup = signup;
      vm.submitSignupForm = submitSignupForm;
      //////////////////////////////////////////////////////

      function signin() {

         if ((!vm.signinForm.password) || (vm.signinForm.password == "")) {
            toastr.error('La contraseña es obligatoria!', 'Alerta');
         }
         else {
            if ((!vm.signinForm.email) || (vm.signinForm.email == "")) {
               toastr.error('El mail es obligatorio!', 'Alerta');
            }
            else {
               var params = {
                  email: vm.signinForm.email,
                  encryptedPassword: vm.signinForm.password.hashCode()
               };
               vm.flags.loading = true;
               $http.put('/login', params)
                  .then(function onSuccess(sailsResponse) {
                     toastr.success('Usuario autenticado!', 'Notificacion');
                     console.log(sailsResponse);
                     window.location = '/';
                  })
                  .catch(function onError(sailsResponse) {
                     vm.flags.loading = false;
                     if (sailsResponse.status == 409) {
                        toastr.error('La direccion de correo ya esta registrada.', 'Error');
                        return;
                     }
                     if (sailsResponse.status === 400 || 404) {
                        toastr.error('Mail o contraseña inválidas.', 'Error');
                        return;
                     }
                     toastr.error('Ha ocurrido un error inesperado, vuelva a intentarlo.', 'Error');
                  })
                  .finally(function eitherway() {

                  });
            }
         }
      }

      function signup() {
         vm.flags.enableLogin = false;
      }

      function submitSignupForm() {
         vm.flags.loading = true;
         var params = {
            firstName: vm.signupForm.firstName,
            lastName: vm.signupForm.lastName,
            email: vm.signupForm.email,
            encryptedPassword: vm.signupForm.password.hashCode()
         };
         $http.post('/signup', params)
            .then(function onSuccess(sailsResponse) {
               window.location = '/';
               console.log(sailsResponse);
            })
            .catch(function onError(sailsResponse) {
               var emailAlreadyInUse = (sailsResponse.status == 409);
               if (emailAlreadyInUse) {
                  toastr.error('La direccion de correo ya esta registrada.', 'Error');
                  return;
               }
            })
            .finally(function eitherway() {
               vm.flags.loading = false;
            });
      }
   }
})();
