/* Poliza de usuario comun */

module.exports=function(req, res, ok){
    var sessionUserMatchesId = req.session.User.id = req.param('id');
    var isAdmin = req.session.User.admin;
    if (!(sessionUserMatchesId || isAdmin)){
        var noRightsError = [{'name':'no tiene autorizacion', 'message':'Debe ser administrador'}];
        req.session.flash = {err:noRightsError};
        res.redirect('/login');
        return;
    }
    ok();
}