(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: ChampionshipView
	///
	app.controller('ChampionshipViewController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 
		'signupPrompter', 'customerMgmt', 'championshipMgmt',
		'poolMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, 
		signupPrompter, customerMgmt, championshipMgmt,
		poolMgmt
	) {

		var getSessionPromise = customerMgmt.getSession();
		getSessionPromise.then(function(sessionData) {

			var getChampionshipPromise = championshipMgmt.getChampionship($routeParams.id);
			getChampionshipPromise.then(function(championshipData) {

				var getPoolsPromise = poolMgmt.getPools(championshipData.id);
				getPoolsPromise.then(function(poolData) {

					championshipData.pools = poolData;

					console.log('championshipData:');
					console.log(championshipData);
		
					$scope.championship = championshipData;
				});

			});
			
		}).catch(function(err) {
			console.log('customerMgmt.getSession() failed');
			console.log(err);
		});

		function getEntityName(entityId) {
			var url = '/entities/' + entityId;
			$http.get(url).then(function(res) {
				console.log('res.data.name:');
				console.log(res.data.name);
				return res.data.name;
			});
		}

	}

}());
