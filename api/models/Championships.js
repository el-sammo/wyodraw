/**
* Championships.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var tablize = require('sd-datatables');

module.exports = {
  ///
  // Attributes
  ///

  attributes: {
		name: {
      type: 'string',
      required: true
		},
		location: {
      type: 'string',
      required: true
		},
    date: {
      type: 'string',
      required: true
    },
    expires: {
      type: 'integer',
      required: true
    }
  },

};

tablize(module.exports);

