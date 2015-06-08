(function() {
	'use strict';

	var app = angular.module('app');

	app.factory('sessionMgr', function($rootScope, $http, $q) {
		var service = {
			getSession: function() {
				return $http.get('/customers/session').then(function(sessionRes) {
					if(! (sessionRes && sessionRes.data)) {
						return $q.reject(
							'Invalid session response: ' + JSON.stringify(sessionRes)
						);
					}
					return sessionRes.data;

				}).catch(function(err) {
					console.error(err);
					$q.reject(err);
				});
			}
		};

		return service;
	});

}());
