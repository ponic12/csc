/**
 * BitacoraController
 *
 * @description :: Server-side logic for managing bitacoras
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 /*global Bitacora*/

module.exports = {
  // getBitacoras: function(req, res) {
  //     console.log('Levanta todas las bitacoras...');
  //     return res;
  // },
  // createBitacora: function(req, res){
  //     console.log('Crea bitacora...');
  //     return res;
  // },

  get: function(req, res) {
    Bitacora.find()
      .exec(function(err, bitacoras) {
        if (err) {
          return res.json(err);
        }
        return res.json(bitacoras);
      });
  },

};
