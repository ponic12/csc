/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
  /*global User*/
  /*global sails*/

module.exports = {
  showHomePage: function(req, res) {

    // If not logged in, show the public view.
    if (!req.session.me) {
      return res.view('login/login');
    }

    // Otherwise, look up the logged-in user and show the logged-in view,
    // bootstrapping basic user data in the HTML sent from the server
    User.findOne(req.session.me, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('La sesion se refiere a un usuario que no existe.');
        return res.view('login/login');
      }

      return res.view('csc', {
        me: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          email: user.email
        }
      });
    });
  },
};
