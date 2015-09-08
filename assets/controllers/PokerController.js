(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Poker
	///
	app.controller('PokerController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 
		'signupPrompter', 'playerMgmt', 'tournamentMgmt', 
		'tableMgmt', 'handMgmt', 'boardMgmt', 'buttonMgmt',
		'chipMgmt', 'potMgmt', 'betMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, 
		signupPrompter, playerMgmt, tournamentMgmt,
		tableMgmt, handMgmt, boardMgmt, buttonMgmt, 
		chipMgmt, potMgmt, betMgmt
	) {

		signupPrompter.prompt();

		$scope.showAvailableTournaments = false;
		$scope.showAvailableTournamentTables = false;
		$scope.showCurrentTournamentTable = false;

		///
		// Start Debug Code
		///

		$rootScope.tournamentId = '55c609826b21c5d777df761b';
		$rootScope.tableId = '55c609ae6b21c5d777df761c';

		///
		// End Debug Code
		///

		var getSessionPromise = playerMgmt.getSession();
		getSessionPromise.then(function(sessionData) {
			console.log('sessionData:');
			console.log(sessionData);

			if(!sessionData.playerId) {
				signupPrompter.prompt();
			} else {
				$rootScope.playerId = sessionData.playerId;
				$scope.playerId = $rootScope.playerId;
			}

			if(! $rootScope.tournamentId) {
				// need tournament id
				console.log('missing tournamentId');
				$scope.showAvailableTournaments = true;
			}
	
			if(! $rootScope.tableId) {
				// need table id
				console.log('missing tableId');
				$scope.showAvailableTournamentTables = true;
			}
	
			if(! $rootScope.handId) {
				// need hand id
				console.log('missing handId');
	
				var createHandPromise = handMgmt.createHand($rootScope.tournamentId, $rootScope.tableId);
				createHandPromise.then(function(hand) {
					console.log('hand created with id: '+hand.data.id);
					$rootScope.handId = hand.data.id;
					$scope.handId = $rootScope.handId;
	
					var createDeckPromise = handMgmt.createDeck(hand.data);
					createDeckPromise.then(function(deck) {
						console.log('created deck:');
						console.log(deck.data.cards);
						$rootScope.deck = deck.data.cards;
					});
				});
			} else {
				// have hand id
				console.log('handId found: '+$rootScope.handId);

				var getHandPromise = handMgmt.getHand($rootScope.handId);
				getHandPromise.then(function(hand) {
					console.log('hand:');
					console.log(hand);
				}).catch(function(err) {
					console.log('getHandPromise() failed');
					console.log(err);
				});
			}
		}).catch(function(err) {
			console.log('playerMgmt.getSession() failed');
			console.log(err);
		});

		$scope.tournamentRegister = function(tournamentId, playerId) {
			console.log('$scope.tournamentRegister() called with tournamentId: '+$scope.tournamentRegister+' and playerId: '+playerId);
		}

	}

}());
