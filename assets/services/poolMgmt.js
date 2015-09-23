(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Pool Management
	///

	app.factory('poolMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var getPoolPromise;
		var getPoolsPromise;

		var service = {
			getPool: function(poolId) {
				if(getPoolPromise) {
					return getPoolPromise;
				}

				var url = '/pools/' + poolId;
				getPoolPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getPoolPromise;
			},

			getPools: function(championshipId) {
				if(getPoolsPromise) {
					return getPoolsPromise;
				}

				var url = '/pools/byChampionshipId/' + championshipId;
				getPoolsPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getPoolsPromise;
			}

		};

		return service;
	}

}());
