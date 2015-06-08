(function() {
	'use strict';

	var app = angular.module('app');

	app.controller('AccountEditController', function(
		navMgr, messenger, pod, customerSchema, $scope, $http, $routeParams, $rootScope
	) {
		navMgr.protect(function() { return $scope.form.$dirty; });
		pod.podize($scope);

		$scope.customerSchema = customerSchema;
		$scope.editMode = true;

		$http.get(
			'/customers/' + $routeParams.id
		).success(function(data, status, headers, config) {
			$scope.customer = customerSchema.populateDefaults(data);
		});

		$scope.save = function save(customer, options) {
			options || (options = {});

			// TODO
			// clean phone; integers only

			$http.put(
				'/customers/' + customer.id, customer
			).success(function(data, status, headers, config) {
				if(status >= 400) return;

				messenger.show('Your account has been updated.', 'Success!');

				$scope.form.$setPristine();
			});
		};

		$scope.cancel = function cancel() {
			navMgr.cancel('/app/account/' +$routeParams.id);
		};
	});

}());
