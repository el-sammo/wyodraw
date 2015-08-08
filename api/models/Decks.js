/**
* Decks.js
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
		},
    handId: {
      type: 'string',
      required: true
		}
  },

  beforeCreate: function(attrs, next) {
    var cardArray = [
			1,2,3,4,5,6,7,8,9,10,11,12,13,
			14,15,16,17,18,19,20,21,22,23,24,25,26,
			27,28,29,30,31,32,33,34,35,36,37,38,39,
			40,41,42,43,44,45,46,47,48,49,50,51,52
		];

		shuffledCards = [];

		while(cardArray.length > 0) {
			var card = cardArray[Math.floor(Math.random() * cardArray.length)];
			var index = cardArray.indexOf(card);
			shuffledCards.push(card);
			if(index > -1) {
				cardArray.splice(index, 1);
			}
		}

    attrs.cards = shuffledCards;
    next();
  }

};

