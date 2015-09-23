(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Home
	///
	app.controller('HomeController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 
		'signupPrompter', 'customerMgmt', 'championshipMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, 
		signupPrompter, customerMgmt, championshipMgmt
	) {

		signupPrompter.prompt();

		var getSessionPromise = customerMgmt.getSession();
		getSessionPromise.then(function(sessionData) {

			var getChampionshipsPromise = championshipMgmt.getCurrentChampionships();
			getChampionshipsPromise.then(function(championshipData) {
				$scope.championships = championshipData;
			});

			if(!sessionData.customerId) {
				signupPrompter.prompt();
			} else {
				$rootScope.customerId = sessionData.customerId;
				$scope.customerId = $rootScope.customerId;
			}
		}).catch(function(err) {
			console.log('customerMgmt.getSession() failed');
			console.log(err);
		});

	}

}());
