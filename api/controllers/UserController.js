/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/*global User*/

module.exports = {
   get: function(req, res) {
      console.log(req.session);

      User.find()
         .populate('roles')
         .exec(function(err, users) {
            if (err) {
               return res.json(err);
            }
            return res.json(users);
         });
   },
   getRoles: function(req, res) {
      var username = req.params.name;
      User.findOne(username)
         .populate('roles')
         .exec(function(err, user) {
            if (err) {
               return res.json(err);
            }
            return res.json(user.roles);
         });
   },
   login: function(req, res) {
      var paramEmail = req.param('email');
      var paramPwd = req.param('encryptedPassword');
      User.findOne({
            email: paramEmail
         },
         function foundUser(err, user) {
            if (err) return res.negotiate(err);
            if (!user) return res.notFound();
            if (paramPwd != user.encryptedPassword) { return res.notFound(); }
            else {
               var oldDateObj = new Date();
               var newDateObj = new Date(oldDateObj.getTime() + 60000);
               req.session.cookie.expires = newDateObj;
               req.session.me = user.id;
               req.session.User = user;
               req.session.authenticated = true;
               console.log(req.session);
               return res.json({id:user.id}); //res.redirect('/');
            }
         });
   },
   signup: function(req, res) {

      User.create({
         firstName: req.param('firstName'),
         lastName: req.param('lastName'),
         email: req.param('email'),
         encryptedPassword: req.param('encryptedPassword'),
         lastLogin: new Date()
      }, function userCreated(err, newUser) {
         if (err) {
            console.log('err: ', err);
            console.log('err.invalidAttributes: ', err.invalidAttributes);
            if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0] && err.invalidAttributes.emai[0].rule == 'unique') {
               return res.emailAddressInUse();
            }
            return res.negotiate(err);
         }
         return res.json({
            id: newUser.id
         })
      });
   },
   logout: function(req, res) {
      console.log('chau, chau, adios...');
   }
};
