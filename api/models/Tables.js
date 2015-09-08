/**
* Tables.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var tablize = require('sd-datatables');

module.exports = {

  attributes: {
    tournamentId: {
      type: 'string',
      required: true
		},
    name: {
      type: 'string',
      required: true
		}
  },

};

tablize(module.exports);

