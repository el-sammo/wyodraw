(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Contact
	///
	app.controller('ContactController', function($scope, $http, $routeParams, $rootScope) {
		var areaId = $rootScope.areaId;

		var p = $http.get('/areas/' + areaId);

		p.error(function(err) {
			console.log('ContactController: areas ajax failed');
			console.error(err);
		});

		p.then(function(res) {
			$scope.area = res.data;
		});

	});

}());
