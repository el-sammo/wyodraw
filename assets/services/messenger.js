(function() {
	'use strict';

	var app = angular.module('app');

	///
	// User Messaging
	///

	app.factory('messenger', function messengerFactory($rootScope) {
		var service = {
			show: function(msg, title) {
				$rootScope.$broadcast('userMessage', {
					message: msg,
					title: title
				});
			}
		};
		return service;
	});

	app.controller('MessageController', function($scope) {
		$scope.alertType = 'info';

		$scope.close = function() {
			$scope.title = '';
			$scope.userMessage = '';
		};

		$scope.$on('userMessage', function(evt, args) {
			$scope.title = args.title;
			$scope.userMessage = args.message;
		});
	});


}());
