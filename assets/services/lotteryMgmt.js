(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Lottery Management
	///

	app.factory('lotteryMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var getLotteryPromise;
		var getLotteriesPromise;

		var service = {
			getLottery: function(lotteryId) {
				if(getLotteryPromise) {
					return getLotteryPromise;
				}

				var url = '/lotteries/' + lotteryId;
				getLotteryPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getLotteryPromise;
			},
		
			getLotteries: function() {
				if(getLotteriesPromise) {
					return getLotteriesPromise;
				}

				var url = '/lotteries/';
				getLotteriesPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getLotteriesPromise;
			}

		};

		return service;
	}

}());
