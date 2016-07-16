/**
 * Bitacora.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    nombre: {
      'type': 'string',
      'required': true, 
      'unique':true
    },
    color: {
      'type': 'string',
      'required': true 
    },
    historias: {
      collection: 'historia',
      via: 'owner'
    }
  }
};

