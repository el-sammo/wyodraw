(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: DrawingAdd
	///
	app.controller('DrawingAddController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', '$location',
		'$window', 'signupPrompter', 'customerMgmt', 'drawingMgmt',
		'numberMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, $location,
		$window, signupPrompter, customerMgmt, drawingMgmt,
		numberMgmt
	) {

		$scope.addDrawingData = function() {
			var lotteryId = $routeParams.id;
			var drawDate = $scope.drawDate;
			var drawDatePcs = drawDate.split('/');
			var dateStamp = drawDatePcs[2] + drawDatePcs[0] + drawDatePcs[1];
			var drawingData = {
				lotteryId: lotteryId, 
				drawDate: drawDate,
				dateStamp: dateStamp
			};

			var addDrawingPromise = drawingMgmt.addDrawing(drawingData);
			addDrawingPromise.then(function(drawingDataObj) {
				var drawingId = drawingDataObj.id;
				var numbers = $scope.numbers.split(' ');

				numbers.forEach(function(number) {
					var numberData = {
						drawingId: drawingId,
						number: number
					};
					var res = numberMgmt.addNumber(numberData);
				});
			
				$window.location.href = '/app/lottery/560d7f94ab3df4645bf6bdc7';

			}).catch(function(err) {
				console.log('drawingMgmt.addDrawing() failed');
				console.log(err);
			});

		};

	}

}());
