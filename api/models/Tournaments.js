/**
* Tournaments.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var tablize = require('sd-datatables');

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
		},
    desc: {
      type: 'string',
      required: true
		},
    type: {
      type: 'string',
      required: true
		},
    minPlayers: {
      type: 'integer',
      required: true
		},
    maxPlayers: {
      type: 'integer',
      required: true
		},
    startsAt: {
      type: 'integer',
      required: true
		}
  }

};

tablize(module.exports);

