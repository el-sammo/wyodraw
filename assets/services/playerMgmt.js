(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Player Management
	///

	app.factory('playerMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var player;
		var getPlayerPromise;

		var service = {
			getPlayer: function(playerId) {
				if(getPlayerPromise) {
					return getPlayerPromise;
				}

				var url = '/players/' + playerId;
				getPlayerPromise = $http.get(url).then(function(res) {
					mergeIntoPlayer(res.data);
					return player;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getPlayerPromise;
			},

			createPlayer: function(playerData) {
				var url = '/players/create';
				return $http.post(url, playerData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoPlayer(data, true);
						return player;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updatePlayer: function(playerData) {
				var url = '/players/' + playerData.id;
				return $http.put(url, playerData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoPlayer(data, true);
						return player;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			// TODO: This probably can be replaced with client-side only code
			logout: function() {
				var url = '/players/logout';
				return $http.get(url).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoPlayer({}, true);
						// TODO - Clear session also
					}
				).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			getSession: function() {
				var url = '/players/session';
				return $http.get(url).then(function(sessionRes) {
					if(! (sessionRes && sessionRes.data)) {
						return $q.reject(sessionRes);
					}
					return sessionRes.data;

				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					$q.reject(err);
				});
			}

			// TODO - Get player by username
			// :split services/signup.js

		};

		function mergeIntoPlayer(data, replace) {
			if(! player) {
				player = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(player, function(val, key) {
					delete player[key];
				});
			}

			angular.forEach(data, function(val, key) {
				player[key] = val;
			});
		};

		return service;
	}

}());
