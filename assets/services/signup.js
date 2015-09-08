(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Signup
	///

	app.factory('signupPrompter', service);
	
	service.$inject = [
		'playerMgmt', 'layoutMgmt'
	];
	
	function service(
		playerMgmt, layoutMgmt
	) {
		var hasPrompted = false;
		var service = {
			prompt: function() {
				if(hasPrompted) return;
				hasPrompted = true;

				playerMgmt.getSession().then(function(sessionData) {
					if(sessionData.playerId) return;
					layoutMgmt.signUp();
				});
			}
		};
		return service;
	}


	app.controller('SignUpController', controller);
	
	controller.$inject = [
		'$scope', '$modalInstance', '$http',
		'$rootScope', '$window', 'clientConfig',
		'layoutMgmt', 'playerMgmt'
	];

	function controller(
		$scope, $modalInstance, $http,
		$rootScope, $window, clientConfig,
		layoutMgmt, playerMgmt
	) {

		$scope.haveAccount = function() {
			$modalInstance.dismiss('cancel');
			layoutMgmt.logIn();
		};

		$scope.validUsername = true;

		$scope.usernameSearch = function() {
			if($scope.username === '') return;

			$http.get('/players/byUsername/' + $scope.username).then(function(res) {
				$scope.validUsername = ! (res.data.length > 0);
			}).catch(function(err) {
				console.log('layoutMgmt: sut-playersGet ajax failed');
				console.error(err);
			});
		};

		$scope.createAccount = function() {
			var player = {
				username: $scope.username,
				password: $scope.password,
			}

			playerMgmt.createPlayer(player).then(function(playerData) {
				var playerData = playerData.data;
				$modalInstance.dismiss('done');
				$scope.submit({
					username: player.username,
					password: player.password,
					playerId: playerData.id
				});
			}).catch(function(err) {
				// if players ajax fails...
				console.log('LayoutMgmtController: player-create ajax failed');
				console.error(err);
				$modalInstance.dismiss('cancel');
			});
		};

		$scope.submit = function(credentials) {
			$http.post(
				'/login', credentials
			).success(function(data, status, headers, config) {
				// if login ajax succeeds...
				if(status >= 400) {
					console.log('400');
					$rootScope.$broadcast('playerLoggedIn', data.playerId);
					$modalInstance.dismiss('done');
				} else if(status == 200) {
					console.log('200');
					$rootScope.$broadcast('playerLoggedIn', data.playerId);
					$modalInstance.dismiss('done');
				} else {
					console.log('other');
					$rootScope.$broadcast('playerLoggedIn', data.playerId);
					$modalInstance.dismiss('done');
				}
			}).error(function(err) {
				// if login ajax fails...
				console.log('LayoutMgmtController: logIn ajax failed');
				console.error(err);
				$modalInstance.dismiss('cancel');
			});
		};
	}
}());
