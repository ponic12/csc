module.exports = function emailAddressInUse(){
    var res = this.res;
    return res.send(409, 'El mail ya esta siendo utilizado por otro usuario');
}