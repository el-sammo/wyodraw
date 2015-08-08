(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Poker
	///
	app.controller('PokerController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 
		'tableMgmt', 'playerMgmt', 'deckMgmt', 'handMgmt',
		'boardMgmt', 'chipMgmt', 'potMgmt', 'betMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, 
		tableMgmt, playerMgmt, deckMgmt, handMgmt,
		boardMgmt, chipMgmt, potMgmt, betMgmt, buttonMgmt
	) {

		var urlId = $routeParams.id;
		var urlData = $routeParams.id.split('-');

		if(!urlData || urlData.length < 1) {
			// need tournament id
			console.log('missing tournamentId');
		}

		if(urlData && urlData.length > 0 && urlData.length < 2) {
			// need table id
			console.log('missing tableId');

			var tournamentId = urlData[0];
			console.log('tournamentId: '+tournamentId);
		}

		if(urlData && urlData.length > 1 && urlData.length < 3) {
			// need hand id
			console.log('missing handId');

			var tournamentId = urlData[0];
			var tableId = urlData[1];

			var createHandPromise = handMgmt.createHand(tournamentId, tableId);
			createHandPromise.then(function(hand) {

				var createDeckPromise = deckMgmt.createDeck(tournamentId, tableId, hand.data.id);
				createDeckPromise.then(function(deck) {
					console.log('created deck:');
					console.log(deck.data.cards);
					return;
				});
			});
			return;
		}
		return;
	}

}());
