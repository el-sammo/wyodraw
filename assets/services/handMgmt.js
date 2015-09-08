(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Hand Management
	///

	app.factory('handMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var hand;
		var getHandPromise;

		var service = {
			getHand: function(handId) {
				if(getHandPromise) {
					return getHandPromise;
				}

				var url = '/hands/' + handId;
				getHandPromise = $http.get(url).then(function(res) {
					mergeIntoHand(res.data);
					return hand;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getHandPromise;
			},

			createHand: function(tournamentId, tableId) {
				var handAttrs = {tournamentId: tournamentId, tableId: tableId};
				var url = '/hands/create';
				return $http.post(url, handAttrs).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoHand(data, true);
						return hand;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updateHand: function(handData) {
				var url = '/hands/' + handData.id;
				return $http.put(url, handData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoHand(data, true);
						return hand;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			createDeck: function(handData) {
				var cardArray = [
					1,2,3,4,5,6,7,8,9,10,11,12,13,
					14,15,16,17,18,19,20,21,22,23,24,25,26,
					27,28,29,30,31,32,33,34,35,36,37,38,39,
					40,41,42,43,44,45,46,47,48,49,50,51,52
				];

				var shuffledCards = [];

				while(cardArray.length > 0) {
					var card = cardArray[Math.floor(Math.random() * cardArray.length)];
					var index = cardArray.indexOf(card);
					shuffledCards.push(card);
					if(index > -1) {
						cardArray.splice(index, 1);
					}
				}

    		handData.cards = shuffledCards;

				var url = '/hands/' + handData.id;
				return $http.put(url, handData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoHand(data, true);
						return hand;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

		};

		function mergeIntoHand(data, replace) {
			if(! hand) {
				hand = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(hand, function(val, key) {
					delete hand[key];
				});
			}

			angular.forEach(data, function(val, key) {
				hand[key] = val;
			});
		};

		return service;
	}

}());
