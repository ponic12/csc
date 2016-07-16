/**
 * ReservaController
 *
 * @description :: Server-side logic for managing reservas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/*global Huesped*/
/*global Reserva*/

module.exports = {
   signin: function(req, res) {
      // Buscar en la tabla Huespedes x email
      //    Si ocurre un error mostrarlo como warning
      //    Si no se encuentra el email registrado => avisar al usuario y mostrar form vacio
      //        . Crear nuevo Huesped con el mail unicamente
      //        . Crear nueva Reserva vacia y asociarle el Huesped recien creado
      //        . Generar response con la reserva + huesped adjunto
      //    Si el email esta en la tabla Huesped, generar un response con la siguiente info:
      //        . Datos de la ultima reserva en el siguiente orden de prioridad:
      //            . Reserva sin formalizar
      //            . Reserva formalizada no vencida
      //            . Reserva nueva vacia
      //        . Datos personales del huesped
      //        . Generar response con la reserva + huesped adjunto

      var paramEmail = req.param('email');
      if (!paramEmail) return res.notFound();
      
      Huesped.findOne({
            email: paramEmail
         },
         function searchHue(err, foundHue) {
            if (err) return res.negotiate(err);
            if (!foundHue) { // No encuentra huesped => crea huesped y reserva vacia
               Huesped.create({
                     email: paramEmail
                  }, 
                  function(err, hue){
                     if (err) return res.negotiate(err);
                     Reserva.create({
                           guest: hue.id
                        }, 
                        function(err, reserva){
                           if (err) return res.negotiate(err);
                           res.status(201);
                           reserva.guest = hue;
                           return res.json(reserva);
                        }
                     );
                  }
               );
            }
            else { // Encuentra huesped => Evalua reservas
               Reserva.findOne({
                     valid : false, expired : false
                  },
                  function searchResNotValid(err, foundRes) {
                     if (err) return res.negotiate(err);
                     if (!foundRes){ //No encuentra reserva no formalizada (valid) => busca reserva formalizada y no expirada
                        Reserva.findOne({
                           valid : true, expired : false
                        }, 
                        function searchResValid(err, foundRes){
                           if (err) return res.negotiate(err);
                           if (!foundRes){ // No encuentra reserva valida => crea nueva reserva con huesped encontrado
                              Reserva.create({
                                 'guest': foundHue.id
                                 }, 
                                 function(err, reserva){
                                    if (err) return res.negotiate(err);
                                    res.status(201);
                                    reserva.guest = foundHue;
                                    return res.json(reserva);
                                 }
                              );
                           }
                           else { // Encuentra reserva valida y no expirada => devuelve reserva + huesped
                              res.status(200);
                              foundRes.guest = foundHue;
                              return res.json(foundRes);
                           }
                        });
                     }
                     else{ // Encuentra reserva no formalizada y no expirada => devuelve reserva y huesped
                        res.status(200);
                        foundRes.guest = foundHue;
                        return res.json(foundRes);
                     }
                  }
               )
            }
         }
      );
   },

   getReservas: function(req, res) {
      var id = req.params.id;
      Reserva.findAll({
            'owner': id
         })
         .populate('user')
         .exec(function(err, reserva) {
            if (err) {
               return res.json(err);
            }
            return res.json(reserva);
         });
   },
};
