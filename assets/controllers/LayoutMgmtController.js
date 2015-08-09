(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Layout Management
	///

	app.controller('LayoutMgmtController', controller);
	
	controller.$inject = [
		'$scope', '$modalInstance',	'$http',
		'$rootScope', '$window', 'layoutMgmt',
		'messenger', 'deviceMgr', 'playerMgmt'
	];

	function controller(
		$scope, $modalInstance,	$http,
		$rootScope, $window, layoutMgmt,
		messenger, deviceMgr, playerMgmt
	) {

		$scope.badCreds = false;
							
		$scope.accessAccount = $rootScope.accessAccount;

		$scope.credentials = {};

		$scope.noAccount = function() {
			$modalInstance.dismiss('cancel');
			layoutMgmt.signUp($scope.areas);
		};

		$scope.submit = function(credentials) {
			console.log('credentials:');
			console.log(credentials);
			$http.post(
				'/players/login', credentials
			).success(function(data, status, headers, config) {
				// if login ajax succeeds...
				if(status == 200) {
					$rootScope.$broadcast('playerLoggedIn', data.playerId);
					$modalInstance.dismiss('done');
				} else {
					console.log('login error: '+status);
					console.log('data:');
					console.log(data);
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
			playerMgmt.logout().then(function() {
				$modalInstance.dismiss('done');
				$window.location.href = '/app/poker';
			}).catch(function(err) {
				$modalInstance.dismiss('cancel');
				$window.location.href = '/app/poker';
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

	}

}());
