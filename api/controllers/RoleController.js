/**
 * RoleController
 *
 * @description :: Server-side logic for managing roles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/*global Role*/

module.exports = {
  get: function(req, res) {
    Role.find()
      .populate('users')
      .exec(function(err, roles) {
        if (err) {
          return res.json(err);
        }
        return res.json(roles);
      });
  },
  getUsers: function(req, res) {
    var rolename = req.params.name;
    Role.findOne(rolename)
      .populate('users')
      .exec(function(err, role) {
        if (err) {
          return res.json(err);
        }
        return res.json(role.users);
      });
  },
};
