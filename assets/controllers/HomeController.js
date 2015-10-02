(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Home
	///
	app.controller('HomeController', controller);
	
	controller.$inject = [
		'$scope', '$rootScope', 'signupPrompter',
		'lotteryMgmt', 'drawingMgmt', 'numberMgmt', 
		'customerMgmt'
	];

	function controller(
		$scope, $rootScope, signupPrompter,
		lotteryMgmt, drawingMgmt, numberMgmt,
		customerMgmt
	) {

		signupPrompter.prompt();

		var getSessionPromise = customerMgmt.getSession();
		getSessionPromise.then(function(sessionData) {

			var getLotteriesPromise = lotteryMgmt.getLotteries();
			getLotteriesPromise.then(function(lotteryData) {
				$scope.lotteries = lotteryData;
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
