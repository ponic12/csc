/**
 * HistoriaController
 *
 * @description :: Server-side logic for managing historias
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/*global Historia*/
/*global Bitacora*/
module.exports = {

  getByIdBitacora: function(req, res) {
    var idBit = req.params.id;
    Historia.find({'owner':idBit})
      .populate('user')
      .exec(function(err, hist) {
        if (err) {
          return res.json(err);
        }
        return res.json(hist);
      });
  },
  // del: function(req, res) {
  //   var id = req.param('id');
  //   console.log('id:', id);
  //   Historia.findOne(id).exec(
  //     function(err, his) {
  //       if (err)
  //         console.log(err);
  //       else {
  //         delete his.usuario;
  //         console.log(his);
  //         return his;
  //       }
  //     });
  // }
};
