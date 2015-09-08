(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Table Management
	///

	app.factory('tableMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var table;
		var getTablePromise;

		var service = {
			getTable: function(tableId) {
				if(getTablePromise) {
					return getTablePromise;
				}

				var url = '/tables/' + tableId;
				getTablePromise = $http.get(url).then(function(res) {
					mergeIntoTable(res.data);
					return table;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getTablePromise;
			},

			createTable: function() {
				tableAttrs = {name: 'joe'};
				var url = '/tables/create';
				return $http.post(url, tableAttrs).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoTable(data, true);
						return table;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updateTable: function(tableData) {
				var url = '/tables/' + tableData.id;
				return $http.put(url, tableData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoTable(data, true);
						return table;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

		};

		function mergeIntoTable(data, replace) {
			if(! table) {
				table = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(table, function(val, key) {
					delete table[key];
				});
			}

			angular.forEach(data, function(val, key) {
				table[key] = val;
			});
		};

		return service;
	}

}());
