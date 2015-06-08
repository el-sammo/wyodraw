(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Layout Controller
	///


	app.controller('LayoutController', function(
		navMgr, pod, $scope,
		$http, $routeParams, $modal, layoutMgmt,
		$rootScope, sessionMgr, hoursMgr
	) {
		var sessionPromise = sessionMgr.getSession();

		$scope.showMenu = false;

		$scope.menuClicked = function(forceValue) {
			if(! _.isUndefined(forceValue)) {
				$scope.showMenu = forceValue;
				return;
			}
			$scope.showMenu = !$scope.showMenu;
		}

		sessionPromise.then(function(sessionData) {
			if(sessionData.customerId) {
				$scope.accessAccount = true;
				$scope.customerId = sessionData.customerId;
			}

			$scope.logIn = layoutMgmt.logIn;
			$scope.logOut = layoutMgmt.logOut;
			$scope.signUp = layoutMgmt.signUp;
			$scope.feedback = layoutMgmt.feedback;
		});

		$rootScope.$on('customerLoggedIn', function(evt, args) {
			$scope.accessAccount = true;
			$scope.customerId = args;
			$rootScope.$broadcast('orderChanged');
		});

	});

}());
