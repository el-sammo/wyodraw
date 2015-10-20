(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: NumberView
	///
	app.controller('NumberViewController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 
		'signupPrompter', 'customerMgmt', 'lotteryMgmt',
		'drawingMgmt', 'numberMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, 
		signupPrompter, customerMgmt, lotteryMgmt,
		drawingMgmt, numberMgmt
	) {

		var getNumberPromise = numberMgmt.getNumber($routeParams.id);
		getNumberPromise.then(function(numberData) {
			console.log('numberData:');
			console.log(numberData);
		}).catch(function(err) {
			console.log('numberMgmt.getNumber() failed');
			console.log(err);
		});

	}

}());
