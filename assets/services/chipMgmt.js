(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Chip Management
	///

	app.factory('chipMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var chip;
		var getChipPromise;

		var service = {
			getChip: function(chipId) {
				if(getChipPromise) {
					return getChipPromise;
				}

				var url = '/chips/' + chipId;
				getChipPromise = $http.get(url).then(function(res) {
					mergeIntoChip(res.data);
					return chip;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getChipPromise;
			},

			createChip: function() {
				chipAttrs = {name: 'joe'};
				var url = '/chips/create';
				return $http.post(url, chipAttrs).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoChip(data, true);
						return chip;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updateChip: function(chipData) {
				var url = '/chips/' + chipData.id;
				return $http.put(url, chipData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoChip(data, true);
						return chip;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

		};

		function mergeIntoChip(data, replace) {
			if(! chip) {
				chip = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(chip, function(val, key) {
					delete chip[key];
				});
			}

			angular.forEach(data, function(val, key) {
				chip[key] = val;
			});
		};

		return service;
	}

}());
