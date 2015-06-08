(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Layout Management
	///

	app.controller('LayoutMgmtController', function(
		$scope, $modalInstance,	$http,
		$rootScope, $window, layoutMgmt,
		messenger, deviceMgr
	) {

		var p = $http.get('/areas/');

		$scope.badCreds = false;
							
		// if areas ajax fails...
		p.error(function(err) {
			console.log('layoutMgmt: areas ajax failed');
			console.error(err);
		});
									
		// if areas ajax succeeds...
		p.then(function(res) {
			$scope.areas = res.data;
		});

		$scope.areaName = $rootScope.areaName;
		$scope.accessAccount = $rootScope.accessAccount;

		$scope.credentials = {};

		$scope.required = function(field) {
			if(! $scope.submitted || field) return;
			return 'error';
		};

		$scope.noAccount = function() {
			$modalInstance.dismiss('cancel');
			layoutMgmt.signUp($scope.areas);
		};

		$scope.submit = function(credentials) {
			$http.post(
				'/login', credentials
			).success(function(data, status, headers, config) {
				// if login ajax succeeds...
				if(status >= 400) {
					$rootScope.$broadcast('customerLoggedIn', data.customerId);
					$modalInstance.dismiss('done');
				} else if(status == 200) {
					$rootScope.$broadcast('customerLoggedIn', data.customerId);
					$modalInstance.dismiss('done');
				} else {
					$rootScope.$broadcast('customerLoggedIn', data.customerId);
					$modalInstance.dismiss('done');
				}
			}).error(function(err) {
				console.log('we were NOT successful here - 1');
				// if login ajax fails...
				$scope.badCreds = true;
			});
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		}

		$scope.logOut = function() {
			$http.post('/customers/logout').success(function(data, status, headers, config) {
			// if customers ajax succeeds...
				if(status >= 400) {
					$modalInstance.dismiss('done');
					$window.location.href = '/';
				} else if(status == 200) {
					$modalInstance.dismiss('done');
					$window.location.href = '/';
				} else {
					$modalInstance.dismiss('done');
					$window.location.href = '/';
				}
			}).error(function(err) {
				// if customers ajax fails...
					console.log('LayoutMgmtController: logOut ajax failed');
					console.error(err);
					$modalInstance.dismiss('cancel');
			});
		}

		$scope.sendFeedback = function() {
			var feedback = {};
			feedback.areaName = $scope.areaName;
			feedback.email = $scope.email;
			feedback.feedback = $scope.feedback;
			feedback.name = $scope.name;

			$http.post('/feedback/create', feedback).then(function(res) {
				$modalInstance.dismiss('done');
				if(deviceMgr.isBigScreen()) {
					messenger.show('Your feedback has been received.', 'Success!');
				}
				$http.post('/mail/sendFeedbackToManagement/'+res.data.id);
			});
		}

	});

}());
