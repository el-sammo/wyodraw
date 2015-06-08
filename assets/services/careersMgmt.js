(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Careers Management
	///

	app.factory('careersMgmt', function($modal, $rootScope) {
		var service = {
			apply: function(position) {
				$modal.open({
					templateUrl: '/templates/apply.html',
					backdrop: true,
					controller: 'CareersMgmtController',
					resolve: {
						args: function() {
							return {
								position: position
							}
						}
					}
				});
			}
		};
		return service;
	});

	app.controller('CareersMgmtController', function(
		args, $scope, $modalInstance, $http, $rootScope, messenger
	) {
		$scope.apply = function() {
			var applicant = {
				fName: $scope.fName,
				lName: $scope.lName,
				phone: $scope.phone,
				email: $scope.email,
				position: $scope.position,
				areaId: $rootScope.areaId
			}
		
			$http.post(
				'/applicants/create', applicant
			).success(function(data, status, headers, config) {
				// if applicants ajax succeeds...
				if(status >= 400) {
					$modalInstance.dismiss('done');
				} else if(status == 200) {
					$modalInstance.dismiss('done');
					$http.post('/mail/sendToApplicant/'+data.id);
					messenger.show('Your application has been received.', 'Success!');
				} else {
					$modalInstance.dismiss('done');
				}
			}).error(function(err) {
				// if applicants ajax fails...
				console.log('CareersMgmtController: applicants-create ajax failed');
				console.error(err);
				$modalInstance.dismiss('cancel');
			});
		};
	});

}());
