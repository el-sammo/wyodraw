(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Tester
	///
	app.controller('TesterController', function($scope, $http, $rootScope, $q, testerMgmt) {
		var areaId = $rootScope.areaId;
		$scope.apply = testerMgmt.apply;
	});

}());
