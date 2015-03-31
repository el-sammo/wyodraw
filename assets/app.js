
var app = angular.module('app', ['ngRoute', 'ui.bootstrap'])
var $ = jQuery;

///
// Configuration
///

app.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);

///
// Routes
///

app.config(function($routeProvider) {
	///
	// Tester Page
	///

	$routeProvider.when('/tester', {
		controller: 'TesterController',
		templateUrl: '/templates/tester.html'
	});


	///
	// Splash Page
	///

	$routeProvider.when('/', {
		controller: 'RestaurantsController',
		templateUrl: '/templates/restaurants.html'
		//controller: 'SplashController',
		//templateUrl: '/templates/index.html'
	});


	///
	// About Page
	///

	$routeProvider.when('/about', {
		controller: 'AboutController',
		templateUrl: '/templates/about.html'
	});


	///
	// Careers Page
	///

	$routeProvider.when('/careers', {
		controller: 'CareersController',
		templateUrl: '/templates/careers.html'
	});


	///
	// Contact Page
	///

	$routeProvider.when('/contact', {
		controller: 'ContactController',
		templateUrl: '/templates/contact.html'
	});


	///
	// Privacy Page
	///

	$routeProvider.when('/privacy', {
		controller: 'PrivacyController',
		templateUrl: '/templates/privacy.html'
	});


	///
	// Restaurants
	///

	$routeProvider.when('/restaurants/:id', {
		controller: 'RestaurantsController',
		templateUrl: '/templates/restaurants.html'
	});


	$routeProvider.when('/restaurants/', {
		controller: 'RestaurantsController',
		templateUrl: '/templates/restaurants.html'
	});


	///
	// Terms Page
	///

	$routeProvider.when('/terms', {
		controller: 'TermsController',
		templateUrl: '/templates/terms.html'
	});


	///
	// Account
	///

	$routeProvider.when('/account/:id', {
		controller: 'AccountController',
		templateUrl: '/templates/account.html'
	});

	$routeProvider.when('/account/add', {
		controller: 'AccountAddController',
		templateUrl: '/templates/accountForm.html'
	});

	$routeProvider.when('/account/edit/:id', {
		controller: 'AccountEditController',
		templateUrl: '/templates/accountForm.html'
	});


	///
	// Other
	///

	$routeProvider.otherwise({
		redirectTo: '/'
	});
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
// Navbar Management
///

app.factory('navMgr', function navMgrFactory(
	$rootScope, $location, $window, $modal
) {
logger.log('test 1', {key: 'value', arr: ['one', 'two', 'three'], obj: {x: 'y'}});
logger.error('test 2', {key: 'value', arr: ['one', 'two', 'three'], obj: {x: 'y'}});
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


///
// Height Manager
///

app.directive('manageHeight', function($window) {
	function getWindowHeight() {
		return $(angular.element($window)).height();
	}

	function resizeElement(el, newHt) {
		var adjHt = newHt - 342;
		$(el).height(adjHt);
	}

	return function ($scope, element) {
		$scope.$watch(getWindowHeight, function(height) {
			resizeElement(element, height);
		}, true);

		angular.element($window).bind('resize', function() {
			$scope.$apply();
		});
	}
});


///
// Login Controller
///

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

app.controller('LoadServices', function(loginModal, errMgr, fakeAuth, sessionMgr) {});

app.factory('sessionMgr', function($rootScope, $http, $q) {
	var p = $http.get('/customers/session');
			
	var service = {
		getSessionPromise: function() {
			p.catch(function(err) {
				logger.log('AccountController: session ajax failed');
				logger.error(err);
			});

			return p.then(function(sessionRes) {
				return sessionRes.data;
			});
		}
	};

	return service;
});


app.factory('fakeAuth', function($rootScope, $http) {
	var winLocStr = location.hostname;
	var winLocPcs = winLocStr.split('.');

	if(winLocPcs[0] == 'grub2you' || winLocPcs[0] == 'www') {
		// not an area-specific url
	
		// TODO
		// get areaId
		$rootScope.areaId = '54b32e4c3756f5d15ad4ca49';
		// TODO
		// get areaName
		$rootScope.areaName = 'Casper';
		// TODO
		// get areaPhone
		$rootScope.areaPhone = '234-GRUB';

	} else {
		var p = $http.get('/areas/byName/' + winLocPcs[0]);
			
		// if areas ajax fails...
		p.error(function(err) {
			logger.log('fakeAuthFactory: areas ajax failed');
			logger.error(err);
		});
					
		// if areas ajax succeeds...
		p.then(function(res) {
			$rootScope.areaId = res.data[0].id;
			$rootScope.areaName = res.data[0].name;
			$rootScope.areaPhone = res.data[0].phone;
		});

	}

	var corporate = {
		phone: '- - -',
		email: 'info@grub2you.com',
		address: {
			street: 'PO Box 52274',
			city: 'Casper',
			state: 'WY',
			zip: '82605'
		}
	};

	$rootScope.corporate = corporate;

	return {};
});


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
// Authentication Management
///

app.factory('layoutMgmt', function($modal, $rootScope, $http) {
	var service = {
		logIn: function(area) {
			$modal.open({
				templateUrl: '/templates/login.html',
				backdrop: true,
				controller: 'LayoutMgmtController',
				resolve: {
					args: function() {
						return {
							area: area
						}
					}
				}
			});
		},
		logOut: function(area) {
			$modal.open({
				templateUrl: '/templates/logout.html',
				backdrop: true,
				controller: 'LayoutMgmtController',
				resolve: {
					args: function() {
						return {
							area: area
						}
					}
				}
			});
		},
		signUp: function(areas) {

			$modal.open({
				templateUrl: '/templates/signUp.html',
				backdrop: true,
				controller: 'LayoutMgmtController',
				resolve: {
					args: function() {
						return {
							areas: areas
						}
					}
				}
			});
		}
	};
	return service;
});

app.controller('LayoutMgmtController', function(
	args, $scope, $modalInstance, $http, $rootScope, $window
) {

	if(args.areas) {
		$scope.areas = args.areas;
	}

	if($scope.areas && $scope.areas.length === 1) {
		$scope.selArea = _.first($scope.areas).id;
	}

	$scope.areaName = $rootScope.areaName;
	$scope.accessAccount = $rootScope.accessAccount;

	$scope.credentials = {};

	$scope.required = function(field) {
		if(! $scope.submitted || field) return;
	 	return 'error';
	};

	$scope.isFormComplete = function() {
		var isComplete = true;
		[
			'fName', 'lName', 'phone', 'email', 'username', 'password',
			'streetNumber', 'streetName', 'city', 'state', 'zip',
		].forEach(function(fieldName) {
			isComplete = isComplete && $scope[fieldName];
		});
		return isComplete;
	}

	$scope.submit = function(credentials) {
		$http.post(
			'/login', credentials
		).success(function(data, status, headers, config) {
		// if orders ajax succeeds...
			if(status >= 400) {
				$rootScope.$broadcast('customerLoggedIn', data.customerId);
				$modalInstance.dismiss('done');
			} else if(status == 200) {
				$rootScope.$broadcast('customerLoggedIn', data.customerId);
				$modalInstance.dismiss('done');
				$http.post('/mail/sendConfirmationToCustomer/'+data.customerId);
		 	} else {
				$rootScope.$broadcast('customerLoggedIn', data.customerId);
				$modalInstance.dismiss('done');
			}
		}).error(function(err) {
			// if orders ajax fails...
				logger.log('LayoutMgmtController: logIn ajax failed');
				logger.error(err);
				$modalInstance.dismiss('cancel');
		});
	};

	$scope.createAccount = function() {
		$scope.submitted = true;

		if(! $scope.isFormComplete()) {
			return;
		}

		var customer = {
			areaId: $scope.selArea,
			fName: $scope.fName,
			lName: $scope.lName,
			addresses: {
				primary: {
					streetNumber: $scope.streetNumber,
					streetName: $scope.streetName,
					apt: $scope.apt,
					city: $scope.city,
					state: $scope.state,
					zip: $scope.zip
				}
			},
			username: $scope.username,
			password: $scope.password,
			phone: $scope.phone,
			email: $scope.email
		}

		$http.post(
			'/customers/create', customer
		).success(function(data, status, headers, config) {
		// if customers ajax succeeds...
			if(status >= 400) {
				$modalInstance.dismiss('done');
				$scope.submit({username: customer.username, password: customer.password, customerId: data.id});
			} else if(status == 200) {
				$modalInstance.dismiss('done');
				$scope.submit({username: customer.username, password: customer.password, customerId: data.id});
		 	} else {
				$modalInstance.dismiss('done');
				$scope.submit({username: customer.username, password: customer.password, customerId: data.id});
			}
		}).error(function(err) {
			// if customers ajax fails...
				logger.log('LayoutMgmtController: customer-create ajax failed');
				logger.error(err);
				$modalInstance.dismiss('cancel');
		});
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}

	$scope.logOut = function() {
		$http.post('/customers/logout').success(function(data, status, headers, config) {
		// if customers ajax succeeds...
			if(status >= 400) {
				$modalInstance.dismiss('done');
				$window.location.href = '/';
			} else if(status == 200) {
				$modalInstance.dismiss('done');
				$window.location.href = '/';
		 	} else {
				$modalInstance.dismiss('done');
				$window.location.href = '/';
			}
		}).error(function(err) {
			// if customers ajax fails...
				logger.log('LayoutMgmtController: logOut ajax failed');
				logger.error(err);
				$modalInstance.dismiss('cancel');
		});
	}

});


///
// Layout Controller
///


app.controller('LayoutController', function(
	navMgr, pod, $scope,
	$http, $routeParams, $modal, layoutMgmt,
	$rootScope, sessionMgr
) {
	var sessionPromise = sessionMgr.getSessionPromise();

	sessionPromise.then(function(sessionData) {
		if(sessionData.customerId) {
			$scope.accessAccount = true;
			$scope.customerId = sessionData.customerId;
		}
		var p = $http.get('/areas/');
						
		// if areas ajax fails...
		p.error(function(err) {
			logger.log('layoutMgmt: areas ajax failed');
			logger.error(err);
		});
								
		// if orders ajax succeeds...
		p.then(function(res) {
			$scope.areas = res.data;
		});
		
		$scope.logIn = layoutMgmt.logIn;
		$scope.logOut = layoutMgmt.logOut;
		$scope.signUp = layoutMgmt.signUp;
	});

	$rootScope.$on('customerLoggedIn', function(evt, args) {
		$scope.accessAccount = true;
		$scope.customerId = args;
		$rootScope.customerId = args;

		var sessionPromise = sessionMgr.getSessionPromise();

		sessionPromise.then(function(sessionData) {
			var r = $http.get('/orders/bySessionId/' +sessionData.sid);

			// if orders ajax fails...
			r.error(function(err) {
				logger.log('layoutMgmt: cLI-orders-get ajax failed');
				logger.error(err);
			});
									
			// if orders ajax succeeds...
			r.then(function(res) {
				if(res.data.length > 0) {
					order = res.data[0];
					order.customerId = $rootScope.customerId;
	
					var s = $http.put('/orders/' + order.id, order);
					
					// if orders ajax fails...
					s.error(function(err) {
						logger.log('layoutMgmt: cLI-orders-put ajax failed');
						logger.error(err);
					});
	
					s.then(function(res) {
						$rootScope.$broadcast('orderChanged');
					});
				} else {
					$rootScope.$broadcast('orderChanged');
				}
			});
		});
	});

});

///
// Order Management
///

app.factory('orderMgmt', function($modal, $rootScope) {
	var service = {
		add: function(item) {
			$modal.open({
				templateUrl: '/templates/addItemOptions.html',
				backdrop: true,
				controller: 'OrderMgmtController',
				resolve: {
					args: function() {
						return {
							item: item
						}
					}
				}
			});
		},
		remove: function(thing) {
			$modal.open({
				templateUrl: '/templates/removeItemOptions.html',
				backdrop: true,
				controller: 'OrderMgmtController',
				resolve: {
					args: function() {
						return {
							thing: thing
						}
					}
				}
			});
		}
	};
	return service;
});

app.controller('OrderMgmtController', function(
	args, $scope, $modalInstance, $http, $rootScope, sessionMgr, $q
) {
	$('footer').show();
	$scope.item = args.item;
	$scope.thing = args.thing;
	$scope.specInst = '';
	$scope.quantity = 1;
	$scope.selOption = '';

	// If there's only one option, auto-choose it
	if($scope.item && $scope.item.options && $scope.item.options.length === 1) {
		$scope.selOption = _.first($scope.item.options).id;
	}

	$scope.addItemOption = function() {
		var sessionPromise = sessionMgr.getSessionPromise();
	
		sessionPromise.then(function(sessionData) {
			var p;
			if(sessionData.customerId) {
				p = $http.get('/orders/byCustomerId/' + sessionData.customerId);
			} else {
				p = $http.get('/orders/bySessionId/' + sessionData.sid);
			}

			// if orders ajax fails...
			p.catch(function(err) {
				logger.log('OrderMgmtController: addItem-getOrder ajax failed');
				logger.error(err);
				$modalInstance.dismiss('cancel');
			});
						
			// if orders ajax succeeds...
			p.then(function(res) {
				function mergeThings(existingThing, thingToMerge) {
					existingThing.quantity = (
						parseInt(existingThing.quantity) + parseInt(thingToMerge.quantity)
					);

					var specInst = [];
					existingThing.specInst && specInst.push(existingThing.specInst);
					thingToMerge.specInst && specInst.push(thingToMerge.specInst);
					existingThing.specInst = specInst.join('; ');
				}

				function buildThings(existingThings) {
					existingThings || (existingThings = []);

					var selectedOption;
					$scope.item.options.forEach(function(option) {
						if($scope.selOption.localeCompare(option.id)) return;
						selectedOption = option;
					});

					var deferred = $q.defer();

					newThing(selectedOption).then(function(thingToAdd) {
						var isDuplicate = false;
						existingThings.forEach(function(existingThing) {
							if(existingThing.optionId.localeCompare(thingToAdd.optionId)) return;
							isDuplicate = true;
							mergeThings(existingThing, thingToAdd);
						});

						if(! isDuplicate) {
							existingThings.push(thingToAdd);
						}

						deferred.resolve(existingThings);
					}).catch(deferred.reject);

					return deferred.promise;
				}

				function newThing(option) {
					var deferred = $q.defer();

					var p = $scope.getRestaurant(option.id);
					
					p.then(function(data) {
						var thing = {
							name: $scope.item.name,
							option: option.name,
							optionId: option.id,
							price: option.price,
							quantity: $scope.quantity,
							specInst: $scope.specInst,
							restaurantName: data.name,
							restaurantId: data.id
						};

						deferred.resolve(thing);
					});

					p.catch(deferred.reject);

					return deferred.promise;
				}

				function buildOrder(order) {
					var deferred = $q.defer();

					if(! order) {
						if(sessionData.customerId) {
							order = {
								customerId: sessionData.customerId,
								areaId: $rootScope.areaId,
								orderStatus: parseInt(1),
								orphaned: false
							};
						} else {
							order = {
								areaId: $rootScope.areaId,
								orderStatus: parseInt(1),
								sessionId: sessionData.sid,
								orphaned: false
							};
						}
					}

					buildThings(order.things).then(function(things) {
						order.things = things;
						deferred.resolve(order);
					}).catch(deferred.reject);

					return deferred.promise;
				}

				var order = _.first(res.data);
				var method = 'post';
				var url = '/orders/create';

				if(order) {
					method = 'put';
					url = '/orders/' + order.id;
				}

				buildOrder(order).then(function(order) {
					$http[method](url, order).then(function(res) {
						$rootScope.$broadcast('orderChanged');
						$modalInstance.dismiss('done');
					}).catch(function(err) {
						logger.log('OrderMgmtController: Save order failed - ' + method + ' - ' + url);
						logger.error(err);
						$modalInstance.dismiss('cancel');
					});
				});

			});
		});
	};

	$scope.removeThing = function() {
		var sessionPromise = sessionMgr.getSessionPromise();
	
		sessionPromise.then(function(sessionData) {
			if(sessionData.customerId) {
				var p = $http.get('/orders/byCustomerId/' + sessionData.customerId);
			} else {
				var p = $http.get('/orders/bySessionId/' + sessionData.sid);
			}
				
			// if orders ajax fails...
			p.error(function(err) {
				logger.log('OrderMgmtController: addItem-getOrder ajax failed');
				logger.error(err);
				$modalInstance.dismiss('cancel');
			});
						
			// if orders ajax succeeds...
			p.then(function(res) {
				var things = res.data[0].things;
	
				var holdingMap = [];
	
				things.forEach(function(thing) {
					if(!thing.optionId.localeCompare($scope.thing.optionId)) {
						thing.quantity = (parseInt(thing.quantity) - parseInt($scope.quantity));
						if(thing.quantity > 0) {
							holdingMap.push({
								'name': thing.name,
								'option': thing.option,
								'optionId': thing.optionId,
								'price': thing.price,
								'quantity': thing.quantity,
								'specInst': thing.specInst,
								'restaurantName': thing.restaurantName,
								'restaurantId': thing.restaurantId
							});
						}
					} else {
						holdingMap.push({
							'name': thing.name,
							'option': thing.option,
							'optionId': thing.optionId,
							'price': thing.price,
							'quantity': thing.quantity,
							'specInst': thing.specInst,
							'restaurantName': thing.restaurantName,
							'restaurantId': thing.restaurantId
						});
					}
				});
		
				res.data[0].things = holdingMap;
		
				var r = $http.put('/orders/' + res.data[0].id, res.data[0]);
		
				// if orders ajax fails...
				r.error(function(err) {
					logger.log('OrderMgmtController: removeOption-put ajax failed');
					logger.error(err);
					$modalInstance.dismiss('cancel');
				});
							
				// if orders ajax succeeds...
				r.then(function(res) {
					$rootScope.$broadcast('orderChanged');
					$modalInstance.dismiss('done');
				});
			});
		});
	};

	$scope.getRestaurant = function(optionId) {
		return $q(function(resolve, reject) {
			var r = $http.get('/options/' + optionId);
				
			r.error(function(err) {
				logger.log('OrderMgmtController: getRestaurantName-options ajax failed');
				logger.error(err);
				reject(err);
			});
				
			r.then(function(res) {
				var s = $http.get('/items/' + res.data.itemId);
					
				s.error(function(err) {
					logger.log('OrderMgmtController: getRestaurantName-items ajax failed');
					logger.error(err);
					reject(err);
				});
					
				s.then(function(res) {
					var t = $http.get('/menus/' + res.data.menuId);
						
					t.error(function(err) {
						logger.log('OrderMgmtController: getRestaurantName-menus ajax failed');
						logger.error(err);
						reject(err);
					});
						
					t.then(function(res) {
						var u = $http.get('/restaurants/' + res.data.restaurantId);
							
						u.error(function(err) {
							logger.log('OrderMgmtController: getRestaurantName-restaurants ajax failed');
							logger.error(err);
							reject(err);
						});
							
						u.then(function(res) {
							resolve(res.data);
						});
					});
				});
			});
		});
	}

});


///
// Careers Management
///

app.factory('careersMgmt', function($modal, $rootScope) {
	var service = {
		apply: function(position) {
			$modal.open({
				templateUrl: '/templates/apply.html',
				backdrop: true,
				controller: 'CareersMgmtController',
				resolve: {
					args: function() {
						return {
							position: position
						}
					}
				}
			});
		}
	};
	return service;
});

app.controller('CareersMgmtController', function(
	args, $scope, $modalInstance, $http, $rootScope
) {
	$('footer').show();

	$scope.apply = function() {
		var applicant = {
			fName: $scope.fName,
			lName: $scope.lName,
			phone: $scope.phone,
			email: $scope.email,
			position: $scope.position,
			areaId: $rootScope.areaId
		}
	
		$http.post(
			'/applicants/create', applicant
		).success(function(data, status, headers, config) {
			// if applicants ajax succeeds...
			if(status >= 400) {
				$modalInstance.dismiss('done');
			} else if(status == 200) {
				$modalInstance.dismiss('done');
				$http.post('/mail/sendToApplicant/'+data.id);
				messenger.show('Your application has been received.', 'Success!');
			} else {
				$modalInstance.dismiss('done');
			}
		}).error(function(err) {
			// if applicants ajax fails...
			logger.log('CareersMgmtController: applicants-create ajax failed');
			logger.error(err);
			$modalInstance.dismiss('cancel');
		});
	};
});


///
// Tester Management
///

app.factory('testerMgmt', function($modal, $rootScope) {
	var service = {
		apply: function(position) {
			$modal.open({
				templateUrl: '/templates/testerApply.html',
				backdrop: true,
				controller: 'TesterMgmtController',
				resolve: {
					args: function() {
						return {
							position: position
						}
					}
				}
			});
		}
	};
	return service;
});

app.controller('TesterMgmtController', function(
	args, $scope, $modalInstance, $http, $rootScope, messenger
) {
	$('footer').show();

	$scope.apply = function() {
		var applicant = {
			fName: $scope.fName,
			lName: $scope.lName,
			phone: $scope.phone,
			email: $scope.email,
			position: $scope.position,
			areaId: $rootScope.areaId
		}
	
		$http.post(
			'/applicants/create', applicant
		).success(function(data, status, headers, config) {
			// if applicants ajax succeeds...
			if(status >= 400) {
				$modalInstance.dismiss('done');
			} else if(status == 200) {
				$modalInstance.dismiss('done');
				$http.post('/mail/sendToApplicant/'+data.id);
				messenger.show('Your application has been received.', 'Success!');
			} else {
				$modalInstance.dismiss('done');
			}
		}).error(function(err) {
			// if applicants ajax fails...
			logger.log('CareersMgmtController: applicants-create ajax failed');
			logger.error(err);
			$modalInstance.dismiss('cancel');
		});
	};
});


///
// Controllers: Tester
///
app.controller('TesterController', function($scope, $http, $rootScope, testerMgmt) {
	var areaId = $rootScope.areaId;
	$scope.apply = testerMgmt.apply;
});


///
// Controllers: Splash
///
app.controller('SplashController', function($scope, $http, $rootScope) {
	var areaId = $rootScope.areaId;
	var areaName = $rootScope.areaName;
	var areaPhone = $rootScope.areaPhone;

	// Hide Footer on homepage only
	$('footer').hide();

	// News Feeder
	
	var t = $http.get('/stories/byAreaId/' + areaId);

	t.error(function(err) {
		logger.log('SplashController: stories ajax failed');
		logger.error(err);
	});

	t.then(function(res) {
		$scope.stories = res.data;
	});

	// Carousel
	// http://codepen.io/Fabiano/pen/LACzk
  $scope.myInterval = 3000;

	var p = $http.get('/restaurants/featured/' + areaId);

	p.error(function(err) {
		logger.log('SplashController: restaurants ajax failed');
		logger.error(err);
	});

	p.then(function(res) {
		var setIds = {};
		$scope.featuredRestaurants = [];
		$scope.restaurants = res.data;

		$scope.restaurants.forEach(function(restaurant, idx) {
			// TODO these values need to come from a config
			var rotatorMin = 1;
			var rotatorMax = 3;

			// only do this for featured restaurants

			if(restaurant.featured && restaurant.featured === 'true') {
				restaurant.rotatorPanel = Math.floor(Math.random() * (rotatorMax - rotatorMin + 1)) + rotatorMin;
				$scope.getItems(restaurant.id, function(err, featuredItems) {
					var counter = 0;
					restaurant.itemImage1 = '';
					restaurant.itemId1 = '';
					restaurant.menuSlug1 = '';
					restaurant.itemImage2 = '';
					restaurant.itemId2 = '';
					restaurant.menuSlug2 = '';
					restaurant.itemImage3 = '';
					restaurant.itemId3 = '';
					restaurant.menuSlug3 = '';
					restaurant.itemImage4 = '';
					restaurant.itemId4 = '';
					restaurant.menuSlug4 = '';
					restaurant.itemImage5 = '';
					restaurant.itemId5 = '';
					restaurant.menuSlug5 = '';
					restaurant.itemImage6 = '';
					restaurant.itemId6 = '';
					restaurant.menuSlug6 = '';
					restaurant.itemImage7 = '';
					restaurant.itemId7 = '';
					restaurant.menuSlug7 = '';
					restaurant.itemImage8 = '';
					restaurant.itemId8 = '';
					restaurant.menuSlug8 = '';
					restaurant.itemImage9 = '';
					restaurant.itemId9 = '';
					restaurant.menuSlug9 = '';
					restaurant.itemImage10 = '';
					restaurant.itemId10 = '';
					restaurant.menuSlug10 = '';
					if(featuredItems.length > 9) {
						featuredItems.forEach(function(item) {
							counter ++;
							if(counter < 11) {
								if(restaurant.itemImage1.length < 1) {
									restaurant.itemImage1 = item.itemImage;
									restaurant.itemId1 = item.itemId;
									restaurant.menuSlug1 = item.menuSlug;
								} else if(restaurant.itemImage2.length < 1) {
									restaurant.itemImage2 = item.itemImage;
									restaurant.itemId2 = item.itemId;
									restaurant.menuSlug2 = item.menuSlug;
								} else if(restaurant.itemImage3.length < 1) {
									restaurant.itemImage3 = item.itemImage;
									restaurant.itemId3 = item.itemId;
									restaurant.menuSlug3 = item.menuSlug;
								} else if(restaurant.itemImage4.length < 1) {
									restaurant.itemImage4 = item.itemImage;
									restaurant.itemId4 = item.itemId;
									restaurant.menuSlug4 = item.menuSlug;
								} else if(restaurant.itemImage5.length < 1) {
									restaurant.itemImage5 = item.itemImage;
									restaurant.itemId5 = item.itemId;
									restaurant.menuSlug5 = item.menuSlug;
								} else if(restaurant.itemImage6.length < 1) {
									restaurant.itemImage6 = item.itemImage;
									restaurant.itemId6 = item.itemId;
									restaurant.menuSlug6 = item.menuSlug;
								} else if(restaurant.itemImage7.length < 1) {
									restaurant.itemImage7 = item.itemImage;
									restaurant.itemId7 = item.itemId;
									restaurant.menuSlug7 = item.menuSlug;
								} else if(restaurant.itemImage8.length < 1) {
									restaurant.itemImage8 = item.itemImage;
									restaurant.itemId8 = item.itemId;
									restaurant.menuSlug8 = item.menuSlug;
								} else if(restaurant.itemImage9.length < 1) {
									restaurant.itemImage9 = item.itemImage;
									restaurant.itemId9 = item.itemId;
									restaurant.menuSlug9 = item.menuSlug;
								} else {
									restaurant.itemImage10 = item.itemImage;
									restaurant.itemId10 = item.itemId;
									restaurant.menuSlug10 = item.menuSlug;
								}
							}
						});
						restaurant.featuredItems = featuredItems;
						if(! setIds[restaurant.id]) {
							$scope.featuredRestaurants.push(restaurant);
							setIds[restaurant.id] = true;
						}
					}
				});
			}
		});
	});

	$scope.getItems = function(id, callback) {
		var frItems = [];
		var r = $http.get('/menus/byRestaurantId/' + id);

		r.error(function(err) {
			logger.log('SplashController: getItems-menus ajax failed');
			logger.error(err);
		});

		r.then(function(res) {
			res.data.map(function(menu) {
				var s = $http.get('/items/byMenuId/' + menu.id);
		
				s.error(function(err) {
					logger.log('SplashController: getItems-menus ajax failed');
					logger.error(err);
				});
		
				s.then(function(res) {
					res.data.forEach(function(item) {
						if(item.image) {
							frItems.push({'itemId': item.id, 'itemImage': item.image, 'menuSlug': menu.slug});
						}
					});
					if(frItems.length > 9) {
						var tempArray = frItems;
						var randex;
						var counter = 0;
						var outArray = [];
						while(counter < 10) {
							randex = Math.floor(Math.random() * (tempArray.length - 0)) + 0;
							outArray.push(tempArray[randex]);
							tempArray.splice(randex, 1);
							counter ++;
						}

						callback(null, outArray);
					}
				});
			});
		});
	};
});


///
// Controllers: About
///
app.controller('AboutController', function($scope, $http, $routeParams, $rootScope) {
	$('footer').show();
	var areaId = $rootScope.areaId;

	var p = $http.get('/areas/' + areaId);

	p.error(function(err) {
		logger.log('AboutController: areas ajax failed');
		logger.error(err);
	});

	p.then(function(res) {
		$scope.area = res.data;
	});

});


///
// Controllers: Careers
///
app.controller('CareersController', function($scope, $http, $routeParams, $rootScope, careersMgmt) {
	$('footer').show();
	var areaId = $rootScope.areaId;

	$scope.apply = careersMgmt.apply;

	var p = $http.get('/areas/' + areaId);

	p.error(function(err) {
		logger.log('CareersController: areas ajax failed');
		logger.error(err);
	});

	p.then(function(res) {
		$scope.area = res.data;
	});

});


///
// Controllers: Contact
///
app.controller('ContactController', function($scope, $http, $routeParams, $rootScope) {
	$('footer').show();
	var areaId = $rootScope.areaId;

	var p = $http.get('/areas/' + areaId);

	p.error(function(err) {
		logger.log('ContactController: areas ajax failed');
		logger.error(err);
	});

	p.then(function(res) {
		$scope.area = res.data;
	});

});


///
// Controllers: Privacy
///
app.controller('PrivacyController', function($scope, $http, $routeParams, $rootScope) {
	$('footer').show();
});


///
// Controllers: Restaurants
///

app.config(function(httpInterceptorProvider) {
	httpInterceptorProvider.register(/^\/restaurants/);
});

app.controller('RestaurantsController', function(
	$scope, $http, $routeParams,
	$modal, orderMgmt, $rootScope
) {
	$('footer').show();
	var areaId = $rootScope.areaId;

	$scope.getUglySlug = function() {
		// retrieve restaurants
		var p = $http.get('/restaurants/byAreaId/' + areaId);
	
		// if restaurants ajax fails...
		p.error(function(err) {
			logger.log('RestaurantsController: getUglySlug-restaurants ajax failed');
			logger.error(err);
		});
	
		// if restaurants ajax succeeds...
		p.then(function(res) {
			var restLength = res.data.length;

			var randRestId = res.data[Math.floor((Math.random() * restLength))].id;

			var r = $http.get('/menus/byRestaurantId/' + randRestId);
			
			// if menus ajax fails...
			r.error(function(err) {
				logger.log('RestaurantsController: getUglySlug-menus ajax failed');
				logger.error(err);
			});
		
			// if menus ajax succeeds...
			r.then(function(res) {
				var menuLength = res.data.length;

				var elSluggo = res.data[Math.floor((Math.random() * menuLength))].slug;

				$scope.buildRestMenus(elSluggo);
			});
		});
	}

	$scope.buildRestMenus = function(slug) {
		// retrieve restaurants
		var p = $http.get('/restaurants/byAreaId/' + areaId);
	
		// if restaurants ajax fails...
		p.error(function(err) {
			logger.log('RestaurantsController: restaurants ajax failed');
			logger.error(err);
		});
		
		// if restaurants ajax succeeds...
		p.then(function(res) {
			var allRestaurants = res.data;
	
			allRestaurants.map(function(restaurant) {
				if(slug.match(restaurant.slug)) {
					$scope.showRestaurant(restaurant.id);
					$scope.displayRestaurant = restaurant;
				}
	
				var r = $http.get('/menus/byRestaurantId/' + restaurant.id);
				
				// if menus ajax fails...
				r.error(function(err) {
					logger.log('RestaurantsController: returnMenus ajax failed');
					logger.error(err);
				});
			
				// if menus ajax succeeds...
				r.then(function(res) {
					restaurant.menus = res.data;
					restaurant.menus.forEach(function(menu) {
						if(menu.slug == slug) {
							$scope.showMenu(menu.id);
							$scope.displayMenu = menu;
						}
					});
				});
			});
	
			$scope.restaurantId = allRestaurants[0].id;
			$scope.restaurantName = allRestaurants[0].name;
			$scope.restaurantImg = allRestaurants[0].image;
	
			$scope.restaurants = allRestaurants;
	
			$scope.getMenus($scope.restaurantId, true);
		});
	}

	if($routeParams.id) {
		$scope.buildRestMenus($routeParams.id);
	} else {
		$scope.getUglySlug();
	}

	$scope.imageUrl = '/images/';

	// get menus by restaurant id
	$scope.getMenus = function(restaurantId, firstMenu) {
		var p = $http.get('/menus/byRestaurantId/' + restaurantId);
	
		// if menus ajax fails...
		p.error(function(err) {
			logger.log('RestaurantsController: getMenus ajax failed');
			logger.error(err);
		});

		// if menus ajax succeeds...
		p.then(function(res) {
			$scope.menus = res.data;
			if(firstMenu) {
				$scope.menuId = res.data[0].id;
				$scope.menuName = res.data[0].name;
				$scope.menuImg = res.data[0].image;
			}
			$scope.firstMenu = firstMenu;
		});
	};

	// retrieve items by menu id (including options)
	$scope.getItems = function(menuId) {
		var p = $http.get('/items/byMenuId/' + menuId);
	
		// if items ajax fails...
		p.error(function(err) {
			logger.log('RestaurantsController: getItems ajax failed');
			logger.error(err);
		});

		// if items ajax succeeds...
		p.then(function(res) {
			var allItems = res.data;

			allItems.map(function(item) {
				var r = $http.get('/options/byItemId/' + item.id);
			
				// if options ajax fails...
				r.error(function(err) {
					logger.log('RestaurantsController: getItems-options ajax failed');
					logger.error(err);
				});
		
				// if options ajax succeeds...
				r.then(function(res) {
					item.options = res.data;
				});
			});

			$scope.items = allItems;
		});
	};

	$scope.restaurantOpen = function(restaurant) {
		var d = new Date();
		var n = d.getDay(); 
		var h = d.getHours(); 
		var m = d.getMinutes(); 
		var s = d.getSeconds(); 

		var openSecs = parseInt(restaurant.hours[n].open);
		var closeSecs = parseInt(restaurant.hours[n].close);

		var hSecs = parseInt(h) * 3600;
		var mSecs = parseInt(m) * 60;
		var sSecs = parseInt(s);

		var nowSecs = (hSecs + mSecs + sSecs);

		if(nowSecs >= openSecs & nowSecs < closeSecs) {
			return true;
		}

		return false;
	};

	$scope.menuOpen = function(menu) {
		var d = new Date();
		var h = d.getHours(); 
		var m = d.getMinutes(); 
		var s = d.getSeconds(); 

		var openSecs = parseInt(menu.availStart);
		var closeSecs = parseInt(menu.availEnd);

		var hSecs = parseInt(h) * 3600;
		var mSecs = parseInt(m) * 60;
		var sSecs = parseInt(s);

		var nowSecs = (hSecs + mSecs + sSecs);

		if(nowSecs >= openSecs & nowSecs < closeSecs) {
			return true;
		}

		return false;
	};

	// retrieve and display restaurant data (including menus)
	$scope.showRestaurant = function(id) {
		$('.hideMenuList').hide();
		$('.hideItemList').hide();
		var p = $http.get('/restaurants/' + id);
	
		// if restaurant ajax fails...
		p.error(function(err) {
			logger.log('RestaurantsController: showRestaurant ajax failed');
			logger.error(err);
		});

		// if restaurant ajax succeeds...
		p.then(function(res) {
			$scope.restaurantId = res.data.id;
			$scope.restaurantName = res.data.name;
			$scope.restaurantImage = res.data.image;
			$scope.getMenus($scope.restaurantId, false);
		
			$('#'+id).show();
			$(window).load(function() {
				$('#'+id).show();
			});
		});
	
	};

	// retrieve and display menu data (including items)
	$scope.showMenu = function(id) {
		var p = $http.get('/menus/' + id);
	
		// if menu ajax fails...
		p.error(function(err) {
			logger.log('RestaurantsController: showMenu ajax failed');
			logger.error(err);
		});

		// if menu ajax succeeds...
		p.then(function(res) {
			$scope.menuId = res.data.id;
			$scope.menuName = res.data.name;
			$scope.getItems($scope.menuId);
		});
	
	};

	$scope.timeFormat = function(secs) {
		var ampm = 'am';
		var hours = Math.floor(secs / 3600);
		if(hours > 12) {
			hours = hours - 12;
			ampm = 'pm';
		}
		var minutes = secs % 3600;
		if(minutes < 1) {
			minutes = '00';
		}
		return hours+':'+minutes+' '+ampm;
	};
});


///
// OrderController
///

app.controller('OrderController', function(
	navMgr, pod, $scope,
	$http, $routeParams, $modal, orderMgmt,
	$rootScope, sessionMgr, $q
) {
	$('footer').show();

	// TODO
	// put this in a config? or what?
	// orderStatus map
	// < 1 = not started
	// 1   = started (ordering)
	// 2   = payment initiated
	// 3   = payment accepted
	// 4   = payment declined
	// 5   = order completed
	// 6   = order ordered (at restaurant)
	// 7   = order picked up
	// 8   = order en route
	// 9   = order delivered
	
	// TODO put in controls that prevent a customer from, for instance, adding items
	// to an order that has already been paid for
	
	$scope.addItem = orderMgmt.add;

	$scope.removeItem = orderMgmt.remove;

	$rootScope.$on('orderChanged', function(evt, args) {
		$scope.updateOrder();
	});

	$scope.updateOrder = function() {
		var sessionPromise = sessionMgr.getSessionPromise();
	
		sessionPromise.then(function(sessionData) {
			if(sessionData.customerId) {
				var p = $http.get('/orders/byCustomerId/' + sessionData.customerId);
			} else if($rootScope.customerId) {
				var p = $http.get('/orders/byCustomerId/' + $rootScope.customerId);
			} else {
				var p = $http.get('/orders/bySessionId/' + sessionData.sid);
			}
	
			// if orders ajax fails...
			p.error(function(err) {
				logger.log('OrderController: updateOrder ajax failed');
				logger.error(err);
			});
					
			// if orders ajax succeeds...
			p.then(function(res) {
				if(res.data.length > 0) {
					var order = res.data[0];
					var rightNow = new Date().getTime();
					var orderSecs = new Date(order.updatedAt).getTime();
					var difference = rightNow - orderSecs;
					if(difference >= 90000000) {
						// this order is stale and the customer needs to start a new order
						$scope.customerOrderExists = false;
					} else {
						// this order is fresh and we can continue using it
						$scope.customerOrderExists = true;
						$scope.orderStatus = parseInt(order.orderStatus);
						$scope.things = order.things;
						$scope.updateTotals(order);
					}
				} else {
					$scope.customerOrderExists = false;
				}
			});
		});
	};

	$scope.updateTotals = function(order) {
		var things = order.things;

		var subtotal = 0;
		var tax = 0;
		// TODO this should be configged on the area level
		var taxRate = .05;
		var multiplier = 100;
		var deliveryFee = 0;
		var discount = 0;
		var gratuity = 0;
		var total = 0;

		things.forEach(function(thing) {
			var lineTotal;

			if(thing.quantity && thing.quantity > 1) {
				lineTotal = parseFloat(thing.price) * thing.quantity;
			} else {
				lineTotal = parseFloat(thing.price);
			}
			subtotal = (Math.round((subtotal + lineTotal) * 100)/100);
		});

		tax = (Math.round((subtotal * taxRate) * 100) / 100);

		if(order.gratuity) {
			gratuity = order.gratuity;
		}

		var sessionPromise = sessionMgr.getSessionPromise();

		sessionPromise.then(function(sessionData) {
			var deliveryFeeTiers = [6.95, 9.95, 12.95];
			deliveryFee = deliveryFeeTiers[0];

			if(sessionData.customerId) {
				var deliveryFeePromise = $scope.calculateDeliveryFee(sessionData.customerId, things);

				deliveryFeePromise.then(function(fee) {
				
					total = (Math.round((subtotal + tax + fee + discount + gratuity) * 100)/100);
			
					$scope.subtotal = subtotal.toFixed(2);
					$scope.tax = tax.toFixed(2);
					$scope.deliveryFee = fee.toFixed(2);
					$scope.discount = discount.toFixed(2);
					$scope.gratuity = gratuity.toFixed(2);
					$scope.total = total.toFixed(2);
			
					order.subtotal = subtotal;
					order.tax = tax;
					order.deliveryFee = $scope.deliveryFee;
					order.discount = discount;
					order.total = total;
			
					var p = $http.put('/orders/' + order.id, order);
					
					// if orders ajax fails...
					p.error(function(err) {
						logger.log('OrderController: updateOrder ajax failed');
						logger.error(err);
					});
				});
			} else {
				total = (Math.round((subtotal + tax + deliveryFee + discount + gratuity) * 100)/100);
		
				$scope.subtotal = subtotal.toFixed(2);
				$scope.tax = tax.toFixed(2);
				$scope.deliveryFee = deliveryFee.toFixed(2);
				$scope.discount = discount.toFixed(2);
				$scope.gratuity = gratuity.toFixed(2);
				$scope.total = total.toFixed(2);
		
				order.subtotal = subtotal;
				order.tax = tax;
				order.deliveryFee = $scope.deliveryFee;
				order.discount = discount;
				order.total = total;
		
				var p = $http.put('/orders/' + order.id, order);
				
				// if orders ajax fails...
				p.error(function(err) {
					logger.log('OrderController: updateOrder ajax failed');
					logger.error(err);
				});
			}
		});
	};

	$scope.calculateDeliveryFee = function(customerId, things) {
		return $q(function(resolve, reject) {
			// time to fee
			// '450': 6.95},
			// '720': 9.95},
			// '1050': 12.95}
			var deliveryFeeTiers = [6.95, 9.95, 12.95];
	
			var t = $http.get('/customers/' + customerId);
					
			t.error(function(err) {
				logger.log('OrderController: calculateDeliveryFee-customer ajax failed');
				logger.error(err);
				resolve(deliveryFeeTiers[0]);
			});
					
			t.then(function(res) {
				var customer = res.data;
	
				var promises = [];
				things.forEach(function(thing) {
					promises.push(driveTimePromise = $scope.getDriveTime(thing, customer));
				});

				$q.all(promises).then(function(durations) {
					var mostDriveTime = 0;
					durations.forEach(function(duration) {
						if(duration > mostDriveTime) {
							mostDriveTime = duration;
						}
					});

					if(mostDriveTime <= 450) {
						resolve(deliveryFeeTiers[0]);
					} else if(mostDriveTime <= 720) {
						resolve(deliveryFeeTiers[1]);
					} else {
						resolve(deliveryFeeTiers[2]);
					}
				});
			});
		});
	};

	$scope.getDriveTime = function(thing, customer) {
		return $q(function(resolve, reject) {
			var v = $http.get('/restaurants/' + thing.restaurantId);
					
			v.error(function(err) {
				logger.log('OrderController: calculateDeliveryFee-gDT-thingRest ajax failed');
				logger.error(err);
			});
	
			// TODO turn debug off / on
			var debug = false;
	
			if(debug) {
				var rotatorMin = 250;
				var rotatorMax = 1280;
				return Math.floor(Math.random() * (rotatorMax - rotatorMin + 1)) + rotatorMin;
			}
					
			v.then(function(res) {
				var addresses = res.data.addresses;
				var delivery = customer.addresses.primary;
				return $http.get('/distances/calc', {
					params: {
						origins: [
							'\''+addresses[0].streetNumber+' '+addresses[0].streetName+' '+addresses[0].city+' '+addresses[0].state+' '+addresses[0].zip+'\''
						].join('|'),
						destinations: [
							'\''+delivery.streetNumber+' '+delivery.streetName+' '+delivery.city+' '+delivery.state+' '+delivery.zip+'\''
						].join('+')
					}
				});
			}).then(function(res) {
				var data = res.data;
				data.rows.forEach(function(row) {
					row.elements.forEach(function(element) {
						var duration = element.duration.value;
						resolve(duration);
					});
				});
			}).catch(function(err) {
				console.error(err);
				resolve(150);
			});
		});
	};
	$scope.updateOrder();
});


///
// Controllers: Account
///


app.factory('customerSchema', function() {
	function nameTransform(customer) {
		if(! customer || ! customer.fName || customer.name.length < 1) {
			return 'customer-name';
		}
		return (customer.name
			.replace(/[^a-zA-Z ]/g, '')
			.replace(/ /g, '-')
			.toLowerCase()
		);
	}

	var service = {
		defaults: {
			customer: {
				areaId: '',
				fName: '',
				lName: '',
				addresses: {
					primary: {
						streetNumber: '',
						streetName: '',
						apt: '',
						city: '',
						state: '',
						zip: ''
					}
				},
				username: '',
				password: '',
				phone: '',
				email: ''
			}
		},

		links: {
			website: {
				placeholder: function(customer) {
					return 'www.' + nameTransform(customer) + '.com';
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

		populateDefaults: function(customer) {
			$.map(service.defaults.customer, function(value, key) {
				if(customer[key]) return;
				if(typeof value === 'object') {
					customer[key] = angular.copy(value);
					return;
				}
				customer[key] = value;
			});
			return customer;
		}
	};

	return service;
});


app.controller('AccountController', function($scope, $http, $routeParams, $rootScope, sessionMgr, $window) {
	$('footer').show();
	var sessionPromise = sessionMgr.getSessionPromise();
	
	sessionPromise.then(function(sessionData) {
		if(!sessionData.customerId && !$rootScope.customerId) {
			$window.location.href = '/';
		}

		var customerId;

		if(sessionData.customerId) {
			customerId = sessionData.customerId;
		} else if($rootScope.customerId) {
			customerId = $rootScope.customerId;
		} else {
			logger.log('AccountController: customerId not found');
		}

		var p = $http.get('/customers/' + customerId);
	
		p.error(function(err) {
			logger.log('AccountController: customers ajax failed');
			logger.error(err);
		});
	
		p.then(function(res) {
			$scope.customer = res.data;
		});
	
		var r = $http.get('/orders/byCustomerId/' + customerId);
	
		r.error(function(err) {
			logger.log('AccountController: orders ajax failed');
			logger.error(err);
		});
	
		r.then(function(res) {
			res.data.map(function(order) {
				order.updatedAt = order.updatedAt.substr(0,10);
				order.total = parseFloat(order.total).toFixed(2);
			});
	
			$scope.orders = res.data;
		});
	});
});

app.controller('AccountAddController', function(
	navMgr, pod, customerSchema,
	$scope, $http, $routeParams, $window, $rootScope
) {
	$('footer').show();
		
	navMgr.protect(function() { return $scope.form.$dirty; });
	pod.podize($scope);

	$scope.customerSchema = customerSchema;
	$scope.customer = customerSchema.populateDefaults({});

	$scope.customer.areaId = $rootScope.areaId;

	// TODO
	// clean phone; integers only

	$scope.save = function save(customer, options) {

		options || (options = {});

		$http.post(
			'/customers/create', customer
			).success(function(data, status, headers, config) {
			if(status >= 400) return;

			navMgr.protect(false);
			$window.location.href = '#/account/' + data.id;
		});
	};

	$scope.cancel = function cancel() {
		navMgr.cancel('#/');
	};
});

app.controller('AccountEditController', function(
	navMgr, messenger, pod, customerSchema, $scope, $http, $routeParams, $rootScope
) {
	$('footer').show();
	navMgr.protect(function() { return $scope.form.$dirty; });
	pod.podize($scope);

	$scope.customerSchema = customerSchema;
	$scope.editMode = true;

	$http.get(
		'/customers/' + $routeParams.id
	).success(function(data, status, headers, config) {
		$scope.customer = customerSchema.populateDefaults(data);
	});

	$scope.save = function save(customer, options) {
		options || (options = {});

		// TODO
		// clean phone; integers only

		$http.put(
			'/customers/' + customer.id, customer
		).success(function(data, status, headers, config) {
			if(status >= 400) return;

			messenger.show('Your account has been updated.', 'Success!');

			$scope.form.$setPristine();
		});
	};

	$scope.cancel = function cancel() {
		navMgr.cancel('#/account/' +$routeParams.id);
	};
});


///
// Controllers: Terms
///
app.controller('TermsController', function($scope, $http, $routeParams, $rootScope) {
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


///
// Focus On
///

/**
 * Focus On - Sets focus to element when value evaluates to true.
 *
 * Example:
 *
 *   <input ng-show="! myVal" focus-on="! myVal">
 *
 */
app.directive('focusOn',function($timeout) {
	return {
		restrict: 'A',
		link: function($scope, element, attr) {
			$scope.$watch(attr.focusOn, function(_focusVal) {
				if(! _focusVal) return;
				$timeout(function() {
					$(element).focus();
				});
			});
		}
	}
});

