(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Account
	///

	app.controller('AccountController', function(
		$scope, $http, messenger, $rootScope,
		$window, payMethodMgmt, layoutMgmt, customerMgmt
	) {

		$scope.addPM = payMethodMgmt.modals.add;
		$scope.removePM = payMethodMgmt.modals.remove;

		$scope.logOut = layoutMgmt.logOut;

		var sessionPromise = customerMgmt.getSession();

		sessionPromise.then(function(sessionData) {
			if(!sessionData.customerId) {
				$window.location.href = '/';
				return;
			}

			var customerId = sessionData.customerId;

			customerMgmt.getCustomer(customerId).then(function(customer) {
				$scope.customer = customer;
				var taxExempt = '';
				if(customer.taxExempt) {
					var taxExempt = 'Tax Exempt';
				}
				$scope.taxExempt = taxExempt;
			});
		
			var r = $http.get('/orders/byCustomerId/' + customerId);
		
			r.error(function(err) {
				console.log('AccountController: orders ajax failed');
				console.error(err);
			});
		
			r.then(function(res) {
				var completedHistory = [];
				res.data.forEach(function(order) {
					if(order.orderStatus > 4) {
						order.updatedAt = order.updatedAt.substr(0,10);
						order.total = parseFloat(order.total).toFixed(2);
						completedHistory.push(order);
					}
				});
		
				$scope.orders = completedHistory;
			});
		});

		$rootScope.$on('customerChanged', function(evt, customer) {
			$scope.customer = customer;
		});
	});

}());
