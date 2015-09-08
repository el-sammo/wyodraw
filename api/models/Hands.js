/**
* Hands.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var bcrypt = require('bcrypt');

module.exports = {

  attributes: {
    tournamentId: {
      type: 'string',
      required: true
		},
    tableId: {
      type: 'string',
      required: true
		}
  }

};

