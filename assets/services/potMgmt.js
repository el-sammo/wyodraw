(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Pot Management
	///

	app.factory('potMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var pot;
		var getPotPromise;

		var service = {
			getPot: function(potId) {
				if(getPotPromise) {
					return getPotPromise;
				}

				var url = '/pots/' + potId;
				getPotPromise = $http.get(url).then(function(res) {
					mergeIntoPot(res.data);
					return pot;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getPotPromise;
			},

			createPot: function() {
				potAttrs = {name: 'joe'};
				var url = '/pots/create';
				return $http.post(url, potAttrs).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoPot(data, true);
						return pot;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updatePot: function(potData) {
				var url = '/pots/' + potData.id;
				return $http.put(url, potData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoPot(data, true);
						return pot;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

		};

		function mergeIntoPot(data, replace) {
			if(! pot) {
				pot = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(pot, function(val, key) {
					delete pot[key];
				});
			}

			angular.forEach(data, function(val, key) {
				pot[key] = val;
			});
		};

		return service;
	}

}());
