
var app = angular.module('app', ['ngRoute', 'ui.bootstrap'])
var $ = jQuery;


///
// Routes
///

app.config(function($routeProvider) {
	///
	// Splash Page
	///

	$routeProvider.when('/', {
		controller: 'SplashController',
		templateUrl: '/templates/index.html'
	});

	///
	// Restaurants
	///

	$routeProvider.when('/restaurants/', {
		controller: 'RestaurantsController',
		templateUrl: '/templates/restaurants.html'
	});


	///
	// Restaurant
	///

	$routeProvider.when('/restaurant/:id', {
		controller: 'RestaurantShowController',
		templateUrl: '/templates/restaurantShow.html'
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
// Controllers: Splash
///

app.controller('SplashController', function($scope, $http, $routeParams) {
	//TODO
	//get areaId
	var areaId = '54b32e4c3756f5d15ad4ca49';
	
	var p = $http.get('/restaurants/byAreaId/' + areaId);

	p.then(function(res) {
		$scope.restaurants = res.data;
	});

	p.error(function(err) {
		console.log(err);
	});

});


///
// Controllers: Restaurants
///

app.config(function(httpInterceptorProvider) {
	httpInterceptorProvider.register(/^\/restaurants/);
});

app.controller('RestaurantsController', function(
	datatables, navMgr, messenger, pod, $scope, $http, $routeParams
) {
	//TODO
	//get areaId
	var areaId = '54b32e4c3756f5d15ad4ca49';
	
	var p = $http.get('/restaurants/byAreaId/' + areaId);

	p.then(function(res) {
		$scope.restaurants = res.data;
	});

	p.error(function(err) {
		console.log(err);
	});


	$scope.restaurantOpen = function(restaurant) {
		var d = new Date();
		var n = d.getDay(); 
		var h = d.getHours(); 
		var m = d.getMinutes(); 
		var s = d.getSeconds(); 

		var thisDayHoursOpen = restaurant.hours[n].open;
		var thisDayHoursClose = restaurant.hours[n].close;

		var oPcs = thisDayHoursOpen.split(':');
		var cPcs = thisDayHoursClose.split(':');

		var oh = oPcs[0];
		var om = oPcs[1];
		var os = oPcs[2];

		var ch = cPcs[0];
		var cm = cPcs[1];
		var cs = cPcs[2];

		var hSecs = parseInt(h) * 3600;
		var mSecs = parseInt(m) * 60;
		var sSecs = parseInt(s);

		var ohSecs = parseInt(oh) * 3600;
		var omSecs = parseInt(om) * 60;
		var osSecs = parseInt(os);

		var chSecs = parseInt(ch) * 3600;
		var cmSecs = parseInt(cm) * 60;
		var csSecs = parseInt(cs);

		var nowSecs = (hSecs + mSecs + sSecs);
		var openSecs = (ohSecs + omSecs + osSecs);
		var closeSecs = (chSecs + cmSecs + csSecs);

		if(nowSecs >= openSecs & nowSecs < closeSecs) {
			return true;
		}

		return false;
	};

});


///
// Controllers: Restaurant
///

app.config(function(httpInterceptorProvider) {
	httpInterceptorProvider.register(/^\/restaurant/);
});

app.controller('RestaurantShowController', function(
	datatables, navMgr, messenger, pod, $scope, $http, $routeParams
) {
	
	var p = $http.get('/restaurants/' + $routeParams.id);

	p.then(function(res) {
		$scope.restaurant = res.data;
	});

	p.error(function(err) {
		console.log(err);
	});

	var r = $http.get('/menus/byRestaurantId/' + $routeParams.id);

	r.then(function(res) {
		$scope.menus = res.data;
		$scope.menuId = res.data[0].id;
		$scope.menuName = res.data[0].name;
	});

	r.error(function(err) {
		console.log(err);
	});

	$scope.menuOpen = function(menu) {
		var d = new Date();
		var n = d.getDay(); 
		var h = d.getHours(); 
		var m = d.getMinutes(); 
		var s = d.getSeconds(); 

		var thisDayHoursOpen = menu.availStart;
		var thisDayHoursClose = menu.availEnd;

		var oPcs = thisDayHoursOpen.split(':');
		var cPcs = thisDayHoursClose.split(':');

		var oh = oPcs[0];
		var om = oPcs[1];
		var os = oPcs[2];

		var ch = cPcs[0];
		var cm = cPcs[1];
		var cs = cPcs[2];

		var hSecs = parseInt(h) * 3600;
		var mSecs = parseInt(m) * 60;
		var sSecs = parseInt(s);

		var ohSecs = parseInt(oh) * 3600;
		var omSecs = parseInt(om) * 60;
		var osSecs = parseInt(os);

		var chSecs = parseInt(ch) * 3600;
		var cmSecs = parseInt(cm) * 60;
		var csSecs = parseInt(cs);

		var nowSecs = (hSecs + mSecs + sSecs);
		var openSecs = (ohSecs + omSecs + osSecs);
		var closeSecs = (chSecs + cmSecs + csSecs);

		if(nowSecs >= openSecs & nowSecs < closeSecs) {
			return true;
		}

		return false;
	};

	$scope.showMenu = function(id) {
		var s = $http.get('/menus/' + id);
	
		s.then(function(res) {
			$scope.menuId = res.data.id;
			$scope.menuName = res.data.name;
		});
	
		s.error(function(err) {
			console.log(err);
		});

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

