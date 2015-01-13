
var app = angular.module('app', ['ngRoute', 'ui.bootstrap'])
var $ = jQuery;


///
// Routes
///

app.config(function($routeProvider) {
	///
	// Areas
	///

	$routeProvider.when('/', {
		controller: 'AreasListController',
		templateUrl: '/templates/list.html'
	});

	$routeProvider.when('/areas/add', {
		controller: 'AreasAddController',
		templateUrl: '/templates/areasForm.html'
	});

	$routeProvider.when('/areas/edit/:id', {
		controller: 'AreasEditController',
		templateUrl: '/templates/areasForm.html'
	});

	$routeProvider.when('/areas/:id', {
		controller: 'AreasShowController',
		templateUrl: '/templates/areas.html'
	});

	///
	// Restaurants
	///

	$routeProvider.when('/restaurants', {
		controller: 'RestaurantsListController',
		templateUrl: '/templates/list.html'
	});

	$routeProvider.when('/restaurants/add', {
		controller: 'RestaurantsAddController',
		templateUrl: '/templates/restaurantsForm.html'
	});

	$routeProvider.when('/restaurants/edit/:id', {
		controller: 'RestaurantsEditController',
		templateUrl: '/templates/restaurantsForm.html'
	});

	$routeProvider.when('/restaurants/:id', {
		controller: 'RestaurantsShowController',
		templateUrl: '/templates/restaurants.html'
	});

	///
	// Other
	///

	$routeProvider.otherwise({
		redirectTo: '/'
	});
});


///
// Navbar Management
///

app.factory('navMgr', function navMgrFactory(
	$rootScope, $location, $window, $modal
) {
	var service = {
		///
		// Form navigation management
		///

		shouldProtect: function() { return false; },

		onNavStart: function(evt, newUrl) {
			if(! this.shouldProtect()) return this.protect(false);

			this.navAway(newUrl);

			evt.preventDefault();
		},

		protect: function(shouldProtect) {
			var value = shouldProtect;

			if(typeof shouldProtect !== 'function') {
				shouldProtect = function() { return value; }
			}
			this.shouldProtect = shouldProtect;
		},

		cancel: function(newUrl) {
			if(! this.shouldProtect()) {
				this.protect(false);
				$window.location.href = newUrl;
				return;
			}
			this.navAway(newUrl);
		},

		navAway: function(newUrl) {
			var self = this;

			var modal = $modal.open({
				templateUrl: '/templates/navAway.html',
				backdrop: 'static',
				resolve: {}
			});

			modal.result.then(function(selected) {
				if(selected == 'save') {
					// TODO
					alert('functionality not implemented: save as draft');
					return;
				}

				self.protect(false);
				$window.location.href = newUrl;
			});
		}
	};

	return service;
});


///
// Error management
///

app.factory('errMgr', function errMgrFactory($modal, $rootScope) {
	var service = {
		show: function(message, title) {
			$modal.open({
				templateUrl: '/templates/error.html',
				backdrop: true,
				controller: 'ErrController',
				resolve: {
					options: function() {
						return {
							message: message || 'An unknown error occurred.',
							title: title || 'Whoops! Something went wrong...'
						};
					}
				}
			});
		}
	};

	$rootScope.$on('httpError', function(evt, args) {
		service.show(args.error);
	});

	return service;
});

app.controller('ErrController', function($scope, options) {
	$scope.options = options;
});


///
// Authentication / Login management
///

app.factory('loginModal', function loginModalFactory($modal, $rootScope) {
	var service = {
		show: function() {
			$modal.open({
				templateUrl: '/templates/login.html',
				backdrop: true,
				controller: 'LoginController'
			});
		}
	};

	$rootScope.$on('httpForbidden', function() {
		service.show();
	});

	return service;
});

app.controller('LoginController', function(
	$scope, $modalInstance, $http, $window
) {

	$scope.credentials = {};

	$scope.submit = function(credentials) {
		$http.post(
			'/login', credentials
		).success(function(data, status, headers, config) {
			return $modalInstance.dismiss('done');
		}).error(function(err) {
			$scope.error = err.error;
		});
	};

	$scope.cancel = function() {
		$window.location.href = '/login';
	};
});


///
// User Messaging
///

app.factory('messenger', function messengerFactory($rootScope) {
	var service = {
		show: function(msg, title) {
			$rootScope.$broadcast('userMessage', {
				message: msg,
				title: title
			});
		}
	};
	return service;
});

app.controller('MessageController', function($scope) {
	$scope.alertType = 'info';

	$scope.close = function() {
		$scope.title = '';
		$scope.userMessage = '';
	};

	$scope.$on('userMessage', function(evt, args) {
		$scope.title = args.title;
		$scope.userMessage = args.message;
	});
});


///
// HTTP interception
///

app.provider('httpInterceptor', function() {
	this.$get = function($q, $location, $rootScope) {
		var service = {
			responseError: function(response) {
				defaultLocation = new RegExp('^' + $location.host() + ':?[0-9]*$');

				// Only handle ajax calls to valid paths
				if(! (isAjax(response) && isRegistered(response))) {
					return $q.reject(response);
				}

				// Handle unauthorized by prompting for login
				if(response.status === 401) {
					$rootScope.$broadcast('httpForbidden');
					return response;
				}

				var errorMsg = generateErrorMsg(response);
				$rootScope.$broadcast('httpError', {error: errorMsg});

				return response;
			}
		};
		return service;
	};

	var registration = [];
	var defaultLocation;

	this.register = function(pathMatch, hostMatch) {
		registration.push({host: hostMatch, path: pathMatch});
	};

	function generateErrorMsg(response) {
		// Everything else, display error message
		var appError = "There's a problem with the application.";
		var networkError = (
			"There's a problem with the network or the server is down."
		);

		var errors = {
			0: networkError,
			400: appError,
			404: appError,
			500: appError
		};

		return (
			(errors[response.status] || appError) +
			' Please try again later.'
		);
	}

	function isAjax(response) {
		var accept = response.config.headers['Accept'] || '';
		return accept.match(/application\/json/);
	}

	function isRegistered(response) {
		var parsed = parseUrl(response.config.url);
		var host = parsed.host;
		var path = parsed.pathname;

		var result = false;
		registration.forEach(function(reg) {
			reg.host || (reg.host = defaultLocation);
			if(host.match(reg.host) && path.match(reg.path)) {
				result = true;
			}
		});

		return result;
	}

	function parseUrl(url) {
		var parser = document.createElement('a');
		parser.href = url;

		return {
			protocol: parser.protocol,
			host: parser.host,
			port: parser.port,
			pathname: parser.pathname,
			hash: parser.hash,
			search: parser.search
		};
	}
});
app.config(function($httpProvider) {
	$httpProvider.interceptors.push('httpInterceptor');
});


///
// Event-Based Services Loader
///

app.controller('LoadServices', function(loginModal, errMgr) {});


///
// Form Pods
///

app.factory('pod', function podFactory(errMgr, $modal) {
	///
	// Event handlers
	///

	function onRemove(list, idx, defaultItem) {
		if(! canRemove(list, idx)) return;

		var filteredItem = {};
		$.map(list[idx], function(value, key) {
			if(key.match(/^\$/)) return;
			filteredItem[key] = value;
		});

		if(JSON.stringify(filteredItem) == JSON.stringify(defaultItem)) {
			list.splice(idx, 1);
			return;
		}

		$modal.open({
			templateUrl: '/templates/podRemoveConfirm.html',
			backdrop: true,
			controller: 'PodController',
			resolve: {
				args: function() {
					return {
						list: list,
						idx: idx
					}
				}
			}
		});
	}

	function onCopy(list, idx) {
		// Index must be within list
		if(idx < 0 || list.length <= idx) {
			return;
		}

		var item = angular.copy(list[idx]);
		spliceItem(list, idx, item);
	}

	function onAdd(list, idx, defaultItem) {
		// Index must be within list
		if(idx < 0 || list.length <= idx) {
			return;
		}

		var item;

		if(defaultItem) {
			item = angular.copy(defaultItem);
		} else {
			item = angular.copy(list[idx]);

			$.map(item, function(value, key) {
				item[key] = '';
			});
		}

		spliceItem(list, idx, item);
	}


	///
	// Utility methods
	///

	function spliceItem(list, idx, item) {
		list.splice(idx + 1, 0, item);
	}

	function canRemove(list, idx) {
		// Cannot remove last pod
		if(list.length < 2) {
			errMgr.show(
				'This item cannot be removed.',
				"I'm sorry, but I can't let you do that..."
			);
			return false;
		}

		// Index must be within list
		if(idx < 0 || list.length <= idx) {
			return false;
		}

		return true;
	}


	///
	// Service definition
	///

	var service = {
		podize: function(scope) {
			scope.$pod = {
				remove: onRemove,
				copy: onCopy,
				add: onAdd
			};
		}
	};
	return service;
});

app.controller('PodController', function(args, $scope, $modalInstance) {
	$scope.list = args.list;
	$scope.idx = args.idx;

	$scope.confirmRemove = function(list, idx) {
		list.splice(idx, 1);
		$modalInstance.dismiss('done');
	};
});


///
// Controllers: Areas
///

app.config(function(httpInterceptorProvider) {
	httpInterceptorProvider.register(/^\/areas/);
});

app.factory('areaSchema', function() {
	function nameTransform(area) {
		if(! area || ! area.name || area.name.length < 1) {
			return 'area-name';
		}
		return (area.name
			.replace(/[^a-zA-Z ]/g, '')
			.replace(/ /g, '-')
			.toLowerCase()
		);
	}

	var service = {
		defaults: {
			area: {
				name: '',
				phone: '',
				subdomain: '',
				franchisee: {
					name: '',
					phone: '',
					email: '',
					address: {
						street: '',
						city: '',
						state: '',
						zip: ''
					}
				}
			}
		},

		links: {
			website: {
				placeholder: function(area) {
					return 'www.' + nameTransform(area) + '.com';
				},
				addon: 'http://'
			},
			facebook: {
				placeholder: nameTransform,
				addon: 'facebook.com/'
			},
			twitter: {
				placeholder: nameTransform,
				addon: '@'
			},
			instagram: {
				placeholder: nameTransform,
				addon: 'instagram.com/'
			},
			pinterest: {
				placeholder: nameTransform,
				addon: 'pinterest.com/'
			},
		},

		populateDefaults: function(area) {
			$.map(service.defaults.area, function(value, key) {
				if(area[key]) return;
				if(typeof value === 'object') {
					area[key] = angular.copy(value);
					return;
				}
				area[key] = value;
			});
			return area;
		}
	};

	return service;
});

// // creating a service to make the area id available to other controllers
// app.factory('AreaID', function() {
// 	return {
// 		areaId: 'init'
// 	};
// });

app.controller('AreasListController', function(datatables, $scope) {
	$scope.name = 'Area';
	$scope.pluralName = 'Areas';
	$scope.path = 'areas';

	datatables.build($scope, {
		id: 'fms-areas-grid',
		ajax: '/areas/datatables',
		actions: [
			{
				url: '#/areas/',
				content: '<i class="fa fa-2x fa-pencil-square-o"></i>'
			}
		],
		cols: [
			{label: 'Actions', data: 'id'},
			{label: 'Name', data: 'name'},
			{label: 'Created', data: 'createdAt', type: 'time'},
			{label: 'Updated', data: 'updatedAt', type: 'time'},
		]
	}); 
});

app.controller('AreasShowController', function(
	datatables, navMgr, messenger, pod, areaSchema, $scope, $http, $routeParams
) {
	$http.get(
		'/areas/' + $routeParams.id
	).success(function(data, status, headers, config) {
		$scope.area = areaSchema.populateDefaults(data);
	});

	$scope.path = 'restaurants';
	areaSchema.defaults.area.id = $routeParams.id;

	datatables.build($scope, {
		id: 'fms-areas-grid',
		ajax: '/restaurants/datatables',
		actions: [
			{
				url: '#/restaurants/',
				content: '<i class="fa fa-2x fa-pencil-square-o"></i>'
			}
		],
		cols: [
			{label: 'Actions', data: 'id'},
			{label: 'Name', data: 'name'},
			{label: 'Created', data: 'createdAt', type: 'time'},
			{label: 'Updated', data: 'updatedAt', type: 'time'},
		]
	}); 
});

app.controller('AreasAddController', function(
	navMgr, messenger, pod, areaSchema, $scope, $http, $window
) {
	navMgr.protect(function() { return $scope.form.$dirty; });
	pod.podize($scope);

	$scope.areaSchema = areaSchema;
	$scope.area = areaSchema.populateDefaults({});

	$scope.save = function save(area, options) {
		options || (options = {});

		$http.post(
			'/areas/create', area
		).success(function(data, status, headers, config) {
			if(status >= 400) return;

			messenger.show('The area has been created.', 'Success!');

			if(options.addMore) {
				$scope.area = {};
				return;
			}

			navMgr.protect(false);
			$window.location.href = '#/areas/' + data.id;
		});
	};

	$scope.cancel = function cancel() {
		navMgr.cancel('#/areas');
	};
});

app.controller('AreasEditController', function(
	navMgr, messenger, pod, areaSchema, $scope, $http, $routeParams
) {
	navMgr.protect(function() { return $scope.form.$dirty; });
	pod.podize($scope);

	$scope.areaSchema = areaSchema;
	$scope.editMode = true;

	$http.get(
		'/areas/' + $routeParams.id
	).success(function(data, status, headers, config) {
		$scope.area = areaSchema.populateDefaults(data);
	});

	$scope.save = function save(area, options) {
		options || (options = {});

		$http.put(
			'/areas/' + area.id, area
		).success(function(data, status, headers, config) {
			if(status >= 400) return;

			messenger.show('The area has been updated.', 'Success!');

			$scope.form.$setPristine();
		});
	};

	$scope.cancel = function cancel() {
		navMgr.cancel('#/areas');
	};
});


///
// Controllers: Restaurants
///

app.config(function(httpInterceptorProvider) {
	httpInterceptorProvider.register(/^\/restaurants/);
});

app.factory('restaurantSchema', function() {
	function nameTransform(restaurant) {
		if(! restaurant || ! restaurant.name || restaurant.name.length < 1) {
			return 'restaurant-name';
		}
		return (restaurant.name
			.replace(/[^a-zA-Z ]/g, '')
			.replace(/ /g, '-')
			.toLowerCase()
		);
	}

	var service = {
		defaults: {
			restaurant: {
				area_id: '',
				name: '',
				desc: '',
				slogan: '',
				cuisine: ''
			}
		},

		links: {
			website: {
				placeholder: function(restaurant) {
					return 'www.' + nameTransform(restaurant) + '.com';
				},
				addon: 'http://'
			},
			facebook: {
				placeholder: nameTransform,
				addon: 'facebook.com/'
			},
			twitter: {
				placeholder: nameTransform,
				addon: '@'
			},
			instagram: {
				placeholder: nameTransform,
				addon: 'instagram.com/'
			},
			pinterest: {
				placeholder: nameTransform,
				addon: 'pinterest.com/'
			},
		},

		populateDefaults: function(restaurant) {
			$.map(service.defaults.restaurant, function(value, key) {
				if(restaurant[key]) return;
				if(typeof value === 'object') {
					restaurant[key] = angular.copy(value);
					return;
				}
				restaurant[key] = value;
			});
			return restaurant;
		}
	};

	return service;
});

app.controller('RestaurantsListController', function(datatables, $scope) {
	$scope.name = 'Restaurant';
	$scope.pluralName = 'Restaurants';
	$scope.path = 'restaurants';

	datatables.build($scope, {
		id: 'fms-restaurants-grid',
		ajax: '/restaurants/datatables',
		actions: [
			{
				url: '#/restaurants/',
				content: '<i class="fa fa-2x fa-pencil-square-o"></i>'
			}
		],
		cols: [
			{label: 'Actions', data: 'id'},
			{label: 'Name', data: 'name'},
			{label: 'Created', data: 'createdAt', type: 'time'},
			{label: 'Updated', data: 'updatedAt', type: 'time'},
		]
	}); 
});

app.controller('RestaurantsShowController', function(
	datatables, navMgr, messenger, pod, restaurantSchema, $scope, $http, $routeParams
) {
	$http.get(
		'/restaurants/' + $routeParams.id
	).success(function(data, status, headers, config) {
		$scope.restaurant = restaurantSchema.populateDefaults(data);
	});

	$scope.path = 'restaurants';

	datatables.build($scope, {
		id: 'fms-restaurants-grid',
		ajax: '/restaurants/datatables',
		actions: [
			{
				url: '#/restaurants/',
				content: '<i class="fa fa-2x fa-pencil-square-o"></i>'
			}
		],
		cols: [
			{label: 'Actions', data: 'id'},
			{label: 'Name', data: 'name'},
			{label: 'Created', data: 'createdAt', type: 'time'},
			{label: 'Updated', data: 'updatedAt', type: 'time'},
		]
	}); 
});

app.controller('RestaurantsAddController', function(
	navMgr, messenger, pod, areaSchema, restaurantSchema, $scope, $http, $window
) {
	
	// todo: this is clunky and gives the user an odd experience
	// if there is no area id to assocaite this restaurant with
	if(!areaSchema.defaults.area.id) {
		// send the user back to the areas list page
		window.location.href = '/';
	};
	
	navMgr.protect(function() { return $scope.form.$dirty; });
	pod.podize($scope);

	$scope.restaurantSchema = restaurantSchema;
	$scope.restaurant = restaurantSchema.populateDefaults({});

	$scope.restaurant.area_id = areaSchema.defaults.area.id;
	console.log($scope.restaurant);

	$scope.save = function save(restaurant, options) {
		options || (options = {});

		$http.post(
			'/restaurants/create', restaurant
		).success(function(data, status, headers, config) {
			if(status >= 400) return;

			messenger.show('The restaurant has been created.', 'Success!');

			if(options.addMore) {
				$scope.restaurant = {};
				return;
			}

			navMgr.protect(false);
			$window.location.href = '#/restaurants/' + data.id;
		});
	};

	$scope.cancel = function cancel() {
		navMgr.cancel('#/restaurants');
	};
});

app.controller('RestaurantsEditController', function(
	navMgr, messenger, pod, restaurantSchema, $scope, $http, $routeParams
) {
	navMgr.protect(function() { return $scope.form.$dirty; });
	pod.podize($scope);

	$scope.restaurantSchema = restaurantSchema;
	$scope.editMode = true;

	$http.get(
		'/restaurants/' + $routeParams.id
	).success(function(data, status, headers, config) {
		$scope.restaurant = restaurantSchema.populateDefaults(data);
	});

	$scope.save = function save(restaurant, options) {
		options || (options = {});

		$http.put(
			'/restaurants/' + restaurant.id, restaurant
		).success(function(data, status, headers, config) {
			if(status >= 400) return;

			messenger.show('The restaurant has been updated.', 'Success!');

			$scope.form.$setPristine();
		});
	};

	$scope.cancel = function cancel() {
		navMgr.cancel('#/restaurants');
	};
});


///
// Holder
///

app.directive('holderJs', function() {
	return {
		link: function(scope, element, attrs) {
			attrs.$set('data-src', attrs.holderJs);
			Holder.run({images:element[0]});
		}
	};
});

