(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Deck Management
	///

	app.factory('deckMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var deck;
		var getDeckPromise;

		var service = {
			getDeck: function(deckId) {
				if(getDeckPromise) {
					return getDeckPromise;
				}

				var url = '/decks/' + deckId;
				getDeckPromise = $http.get(url).then(function(res) {
					mergeIntoDeck(res.data);
					return deck;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getDeckPromise;
			},

			createDeck: function(tournamentId, tableId, handId) {
				var deckAttrs = {tournamentId: tournamentId, tableId: tableId, handId: handId};
				var url = '/decks/create';
				return $http.post(url, deckAttrs).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoDeck(data, true);
						return deck.cards;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updateDeck: function(deckData) {
				var url = '/decks/' + deckData.id;
				return $http.put(url, deckData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoDeck(data, true);
						return deck;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

		};

		function mergeIntoDeck(data, replace) {
			if(! deck) {
				deck = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(deck, function(val, key) {
					delete deck[key];
				});
			}

			angular.forEach(data, function(val, key) {
				deck[key] = val;
			});
		};

		return service;
	}

}());
