(function() {
	'use strict';

	var app = angular.module('app');

	app.controller('AccountModalController', controller);
	
	controller.$inject = [
		'$window', '$rootScope', '$scope', '$modalInstance', 'args', 'messenger',
		'payMethodMgmt'
	];

	function controller(
		$window, $rootScope, $scope, $modalInstance, args, messenger,
		payMethodMgmt
	) {

		if(args.pmId) {
			var pmId = args.pmId;
		}

		$scope.payMethod = {};

		$scope.addPaymentMethod = function() {
			$scope.processing = true;

			var paymentData = {
				cardNumber: $scope.payMethod.cardNumber.toString(),
				expirationDate: $scope.payMethod.year + '-' + $scope.payMethod.month,
				cvv2: $scope.payMethod.cvv2
			};

			payMethodMgmt.addPM(paymentData).then(function(customer){
				$scope.processing = false;
				messenger.show('The payment method has been added.', 'Success!');
				$modalInstance.dismiss('done');

				$rootScope.$broadcast('customerChanged', customer);
			}).catch(function(err) {
				$modalInstance.dismiss('cancel');
			});
		};

		$scope.removePaymentMethod = function() {
			// TODO: mark pmId as inactive
			console.log('$scope.removePaymentMethod() called with:');
			console.log($scope);
			console.log('pmId: '+pmId);
			$modalInstance.dismiss('done');
		};

	}

}());
