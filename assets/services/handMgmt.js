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
