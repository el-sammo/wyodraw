(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Error management
	///

	app.factory('errMgr', function errMgrFactory($modal, $rootScope) {
		var service = {
			show: function(message, title) {
				$modal.open({
					templateUrl: '/templates/error.html',
					backdrop: true,
					controller: 'ErrController',
					resolve: {
						options: function() {
							return {
								message: message || 'An unknown error occurred.',
								title: title || 'Whoops! Something went wrong...'
							};
						}
					}
				});
			}
		};

		$rootScope.$on('httpError', function(evt, args) {
			service.show(args.error);
		});

		return service;
	});

	app.controller('ErrController', function($scope, options) {
		$scope.options = options;
	});

}());
