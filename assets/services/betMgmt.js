(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Bet Management
	///

	app.factory('betMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var bet;
		var getBetPromise;

		var service = {
			getBet: function(betId) {
				if(getBetPromise) {
					return getBetPromise;
				}

				var url = '/bets/' + betId;
				getBetPromise = $http.get(url).then(function(res) {
					mergeIntoBet(res.data);
					return bet;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getBetPromise;
			},

			createBet: function() {
				betAttrs = {name: 'joe'};
				var url = '/bets/create';
				return $http.post(url, betAttrs).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoBet(data, true);
						return bet;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updateBet: function(betData) {
				var url = '/bets/' + betData.id;
				return $http.put(url, betData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoBet(data, true);
						return bet;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

		};

		function mergeIntoBet(data, replace) {
			if(! bet) {
				bet = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(bet, function(val, key) {
					delete bet[key];
				});
			}

			angular.forEach(data, function(val, key) {
				bet[key] = val;
			});
		};

		return service;
	}

}());
