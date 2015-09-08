(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Button Management
	///

	app.factory('buttonMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var button;
		var getButtonPromise;

		var service = {
			getButton: function(buttonId) {
				if(getButtonPromise) {
					return getButtonPromise;
				}

				var url = '/buttons/' + buttonId;
				getButtonPromise = $http.get(url).then(function(res) {
					mergeIntoButton(res.data);
					return button;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getButtonPromise;
			},

			createButton: function() {
				buttonAttrs = {name: 'joe'};
				var url = '/buttons/create';
				return $http.post(url, buttonAttrs).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoButton(data, true);
						return button;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updateButton: function(buttonData) {
				var url = '/buttons/' + buttonData.id;
				return $http.put(url, buttonData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoButton(data, true);
						return button;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

		};

		function mergeIntoButton(data, replace) {
			if(! button) {
				button = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(button, function(val, key) {
					delete button[key];
				});
			}

			angular.forEach(data, function(val, key) {
				button[key] = val;
			});
		};

		return service;
	}

}());
