(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Board Management
	///

	app.factory('boardMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var board;
		var getBoardPromise;

		var service = {
			getBoard: function(boardId) {
				if(getBoardPromise) {
					return getBoardPromise;
				}

				var url = '/boards/' + boardId;
				getBoardPromise = $http.get(url).then(function(res) {
					mergeIntoBoard(res.data);
					return board;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getBoardPromise;
			},

			createBoard: function() {
				boardAttrs = {name: 'joe'};
				var url = '/boards/create';
				return $http.post(url, boardAttrs).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoBoard(data, true);
						return board;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updateBoard: function(boardData) {
				var url = '/boards/' + boardData.id;
				return $http.put(url, boardData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoBoard(data, true);
						return board;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

		};

		function mergeIntoBoard(data, replace) {
			if(! board) {
				board = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(board, function(val, key) {
					delete board[key];
				});
			}

			angular.forEach(data, function(val, key) {
				board[key] = val;
			});
		};

		return service;
	}

}());
