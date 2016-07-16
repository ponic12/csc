/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    empresa: {
      model:'Empresa',
      'required': true
    },
    firstName: {
      'type': 'string',
      'required': true
    },
    lastName: {
      'type': 'string',
      'required': true 
    },
    email:{
      'type':'string',
      'email':true,
      'required':true,
      'unique':true
    },
    encryptedPassword: {
      'type': 'string',
      'required': true
    },
    lastLogin: {
      'type': 'date',
      'required': true,
      'defaultsTo': new Date(0)
    },
    color: {
      'type': 'string',
      'required': true 
    },
    roles:{
      collection:"Role",
      through:"userrole"
    },
    toJSON:function(){
      var obj = this.toObject();
      delete obj.encryptedPassword;
      return obj;
    }
  }
};
