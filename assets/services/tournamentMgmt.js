(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Tournament Management
	///

	app.factory('tournamentMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var tournament;
		var getTournamentPromise;

		var service = {
			getTournament: function(tournamentId) {
				if(getTournamentPromise) {
					return getTournamentPromise;
				}

				var url = '/tournaments/' + tournamentId;
				getTournamentPromise = $http.get(url).then(function(res) {
					mergeIntoTournament(res.data);
					return tournament;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getTournamentPromise;
			},

			createTournament: function() {
				tournamentAttrs = {name: 'joe'};
				var url = '/tournaments/create';
				return $http.post(url, tournamentAttrs).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoTournament(data, true);
						return tournament;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updateTournament: function(tournamentData) {
				var url = '/tournaments/' + tournamentData.id;
				return $http.put(url, tournamentData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoTournament(data, true);
						return tournament;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

		};

		function mergeIntoTournament(data, replace) {
			if(! tournament) {
				tournament = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(tournament, function(val, key) {
					delete tournament[key];
				});
			}

			angular.forEach(data, function(val, key) {
				tournament[key] = val;
			});
		};

		return service;
	}

}());
