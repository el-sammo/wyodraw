(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Number Management
	///

	app.factory('numberMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var getNumberPromise;
		var getNumbersPromise;
		var getNumbersByDrawingIdPromise;

		var service = {
			getNumber: function(numberId) {
				if(getNumberPromise) {
					return getNumberPromise;
				}

				var url = '/stats/' + numberId;
				getNumberPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getNumberPromise;
			},

			getNumbers: function() {
				if(getNumbersPromise) {
					return getNumbersPromise;
				}

				var url = '/numbers/';
				getNumbersPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getNumbersPromise;
			},

			getNumbersByDrawingId: function(drawingId) {
				if(getNumbersByDrawingIdPromise) {
					return getNumbersByDrawingIdPromise;
				}

				var url = '/numbers/byDrawingId/' + drawingId;
				getNumbersByDrawingIdPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getNumbersByDrawingIdPromise;
			}
		};

		return service;
	}

}());
