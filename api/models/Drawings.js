/**
* Drawings.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var tablize = require('sd-datatables');

module.exports = {

  attributes: {
    dateStamp: {
      type: 'integer',
      required: true
    },
    drawDate: {
      type: 'string',
      required: true
    },
		lotteryId: {
      type: 'string',
      required: true
		}
  }
  
};

tablize(module.exports);

