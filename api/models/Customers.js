/**
* Customers.js
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
//    fName: {
//      type: 'string',
//      required: true
//		},
//    lName: {
//      type: 'string',
//      required: true
//		},
    email: {
      type: 'string',
      required: true
		},
    phone: {
      type: 'string',
      required: true
		},
  },

};

tablize(module.exports);

