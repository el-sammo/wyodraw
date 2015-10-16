(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: LotteryView
	///
	app.controller('LotteryViewController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 
		'signupPrompter', 'customerMgmt', 'lotteryMgmt',
		'drawingMgmt', 'numberMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, 
		signupPrompter, customerMgmt, lotteryMgmt,
		drawingMgmt, numberMgmt
	) {

		var getAllNumbersPromise = numberMgmt.getAllNumbers();
		getAllNumbersPromise.then(function(numbersData) {
			$scope.numbersData = numbersData;

			console.log('$scope.numbersData.length: '+$scope.numbersData.length);

			var getSessionPromise = customerMgmt.getSession();
			getSessionPromise.then(function(sessionData) {
	
				var getLotteryPromise = lotteryMgmt.getLottery($routeParams.id);
				getLotteryPromise.then(function(lotteryData) {
	
					var getDrawingsByLotteryIdPromise = drawingMgmt.getDrawingsByLotteryId(lotteryData.id);
					getDrawingsByLotteryIdPromise.then(function(drawingsData) {
	
						drawingsData.forEach(function(drawing) {

							drawing.numbers = [];
							$scope.numbersData.forEach(function(number) {
								if(number.drawingId === drawing.id) {
									drawing.numbers.push(number);
								}
							});
						});
	
						$scope.lotteryData = lotteryData;
						$scope.drawingsData = drawingsData;
					}).catch(function(err) {
						console.log('drawingMgmt.getDrawingsByLotteryId() failed');
						console.log(err);
					});
				}).catch(function(err) {
					console.log('lotteryMgmt.getLottery() failed');
					console.log(err);
				});
			}).catch(function(err) {
				console.log('customerMgmt.getSession() failed');
				console.log(err);
			});
		}).catch(function(err) {
			console.log('numbersMgmt.getNumbers() failed');
			console.log(err);
		});

	}

}());
