(function() {
	'use strict';

	var app = angular.module('app');

	app.controller('AccountAddController', function(
		navMgr, pod, customerSchema,
		$scope, $http, $routeParams, $window, $rootScope
	) {
			
		navMgr.protect(function() { return $scope.form.$dirty; });
		pod.podize($scope);

		$scope.customerSchema = customerSchema;
		$scope.customer = customerSchema.populateDefaults({});

		$scope.customer.areaId = $rootScope.areaId;

		// TODO
		// clean phone; integers only

		$scope.save = function save(customer, options) {

			options || (options = {});

			$http.post(
				'/customers/create', customer
				).success(function(data, status, headers, config) {
				if(status >= 400) return;

				navMgr.protect(false);
				$window.location.href = '/app/account/' + data.id;
			});
		};

		$scope.cancel = function cancel() {
			navMgr.cancel('/app/');
		};
	});

}());
