
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
	// About Page
	///

	$routeProvider.when('/about', {
		controller: 'AboutController',
		templateUrl: '/templates/about.html'
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


///
// Screen Manager
///

app.factory('screenMgr', function($rootScope) {
	// TODO
	// these first three values shouldn't be hard-coded
	var pushDown = 220;
	var footerHeight = 80;
	var otherSpace = 130;
	
	var screenHt = screen.height;

	var acHt = parseInt(screenHt) - parseInt(pushDown) - parseInt(footerHeight) - parseInt(otherSpace);

	var service = {
		acHt: acHt,

		// TODO
		// also need to create an event listener for
		// screen size change then trigger this service
	};

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

app.controller('LoadServices', function(loginModal, errMgr, fakeAuth, screenMgr) {});


app.factory('fakeAuth', function($rootScope, $http, $window, screenMgr) {
	$rootScope.$on('customerLoggedIn', function(evt, args) {
		if($rootScope.customerId) {
			$rootScope.accessAccount = true;
		}
	});

	$rootScope.$on('customerLoggedOut', function(evt, args) {
		$rootScope.customerId = false;
		$rootScope.accessAccount = false;
		$window.location.href = '/';
	});

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
			console.log('fakeAuthFactory: areas ajax failed');
			console.log(err);
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
		login: function() {
			$modal.open({
				templateUrl: '/templates/login.html',
				backdrop: true,
				controller: 'LayoutMgmtController',
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
	args, $scope, $modalInstance, $http, $rootScope
) {

	$scope.areas = args.areas;

	$scope.areaName = $rootScope.areaName;
	$scope.accessAccount = $rootScope.accessAccount;

	$scope.logIn = function() {

		console.log('LayoutMgmtController - logIn() called');
		
//		$http.post(
//			'/orders/create', order
//		).success(function(data, status, headers, config) {
//		// if orders ajax succeeds...
//			if(status >= 400) {
//				$rootScope.$broadcast('orderChanged');
//				$modalInstance.dismiss('done');
//			}
//		}).error(function(err) {
//			// if orders ajax fails...
//				console.log('OrderMgmtController: addOption-create ajax failed');
//				console.log(err);
//				$modalInstance.dismiss('cancel');
//		});
	};

	$scope.createAccount = function() {

		var customer = {
			areaId: $scope.selArea,
			fname: $scope.fName,
			lname: $scope.lName,
			addresses: {
				primary: {
					street: $scope.street,
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
				$rootScope.customerId = data.id;
				$rootScope.$broadcast('customerLoggedIn');
				$modalInstance.dismiss('done');
			} else if(status == 200) {
				$rootScope.customerId = data.id;
				$rootScope.$broadcast('customerLoggedIn');
				$modalInstance.dismiss('done');
		 	} else {
				$rootScope.customerId = data.id;
				$rootScope.$broadcast('customerLoggedIn');
				$modalInstance.dismiss('done');
			}
		}).error(function(err) {
			// if customers ajax fails...
				console.log('LayoutMgmtController: customer-create ajax failed');
				console.log(err);
				$modalInstance.dismiss('cancel');
		});
	};

});


///
// Layout Controller
///


app.controller('LayoutController', function(
	navMgr, messenger, pod, $scope,
	$http, $routeParams, $modal, layoutMgmt,
	$rootScope
) {

	var p = $http.get('/areas/');
					
	// if areas ajax fails...
	p.error(function(err) {
		console.log('layoutMgmt: areas ajax failed');
		console.log(err);
	});
							
	// if orders ajax succeeds...
	p.then(function(res) {
		$scope.areas = res.data;
	});
	
	$scope.logIn = layoutMgmt.logIn;
	$scope.signUp = layoutMgmt.signUp;

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
	args, $scope, $modalInstance, $http, $rootScope
) {
	$scope.item = args.item;
	if($scope.item && $scope.item.options) {
		$scope.itemOptionsLength = $scope.item.options.length;
	}
	$scope.thing = args.thing;
	$scope.specInst = '';
	$scope.quantity = 1;
	$scope.selOption = '';

	$scope.addItemOption = function() {
		var p = $http.get('/orders/byCustomerId/' + $rootScope.customerId);
			
		// if orders ajax fails...
		p.error(function(err) {
			console.log('OrderMgmtController: addItem-getOrder ajax failed');
			console.log(err);
			$modalInstance.dismiss('cancel');
		});
					
		// if orders ajax succeeds...
		p.then(function(res) {
			// TODO get the correct one properly
			// (not an orphaned order)

			// if an uncompleted order already exists, we'll use it
			if(res.data.length > 0) {
				var things = res.data[0].things;
		
				var holdingMap = [];
	
				var thisAddedThing = {};
	
				$scope.item.options.forEach(function(val) {
					if(!$scope.selOption.localeCompare(val.id)) {
						thisAddedThing.name = $scope.item.name;
						thisAddedThing.option = val.name;
						thisAddedThing.optionId = val.id;
						thisAddedThing.price = val.price;
						thisAddedThing.quantity = $scope.quantity;
						thisAddedThing.specInst = $scope.specInst;
					}
				});
	
				if(things.length > 0) {
					var matched = false;
					things.forEach(function(thing) {
						if(!thing.optionId.localeCompare(thisAddedThing.optionId)) {
							thing.quantity = (parseInt(thing.quantity) + parseInt(thisAddedThing.quantity));
	
							// TODO replace this nasty solution for one in which the pre-existing specInst, if any, is in the textarea when adding
							var specInst = '';
							if(thing.specInst && thing.specInst.length > 0) {
						 		if(thisAddedThing.specInst.length > 0) {
									specInst = thing.specInst+'; '+thisAddedThing.specInst;
								} else {
									specInst = thing.specInst;
								}
							} else {
								if(thisAddedThing.specInst.length > 0) {
									specInst = thisAddedThing.specInst;
								}
							}
							holdingMap.push({
								'name': thing.name,
								'option': thing.option,
								'optionId': thing.optionId,
								'price': thing.price,
								'quantity': thing.quantity,
								'specInst': specInst
							});
							matched = true;
						} else {
							holdingMap.push({
								'name': thing.name,
								'option': thing.option,
								'optionId': thing.optionId,
								'price': thing.price,
								'quantity': thing.quantity,
								'specInst': thing.specInst
							});
						}
					});
					if(!matched) {
						holdingMap.push({
							'name': thisAddedThing.name,
							'option': thisAddedThing.option,
							'optionId': thisAddedThing.optionId,
							'price': thisAddedThing.price,
							'quantity': thisAddedThing.quantity,
							'specInst': thisAddedThing.specInst
						});
					}
				} else {
					holdingMap.push({
						'name': thisAddedThing.name,
						'option': thisAddedThing.option,
						'optionId': thisAddedThing.optionId,
						'price': thisAddedThing.price,
						'quantity': thisAddedThing.quantity,
						'specInst': thisAddedThing.specInst
					});
				}
	
				res.data[0].things = holdingMap;
				
				var r = $http.put('/orders/' + res.data[0].id, res.data[0]);
		
				// if orders ajax fails...
				r.error(function(err) {
					console.log('OrderMgmtController: addOption-put ajax failed');
					console.log(err);
					$modalInstance.dismiss('cancel');
				});
							
				// if orders ajax succeeds...
				r.then(function(res) {
					$rootScope.$broadcast('orderChanged');
					$modalInstance.dismiss('done');
				});
			} else {
				// we'll start a new order

				$scope.item.options.forEach(function(val) {
					if(!$scope.selOption.localeCompare(val.id)) {
						var thisAddedThing = {
							name: $scope.item.name,
							option: val.name,
							optionId: val.id,
							price: val.price,
							quantity: $scope.quantity,
							specInst: $scope.specInst,
						};

						var order = {
							customerId: $rootScope.customerId,
							orderStatus: 1,
							things: [
								{
									'name': thisAddedThing.name,
									'option': thisAddedThing.option,
									'optionId': thisAddedThing.optionId,
									'price': thisAddedThing.price,
									'quantity': thisAddedThing.quantity,
									'specInst': thisAddedThing.specInst
								}
							]
						}
		
						$http.post(
							'/orders/create', order
						).success(function(data, status, headers, config) {
						// if orders ajax succeeds...
							if(status >= 400) {
								$rootScope.$broadcast('orderChanged');
								$modalInstance.dismiss('done');
							}
						}).error(function(err) {
						// if orders ajax fails...
							console.log('OrderMgmtController: addOption-create ajax failed');
							console.log(err);
							$modalInstance.dismiss('cancel');
						});
					}
				});
			}
		});
	};

	$scope.removeThing = function() {
		var p = $http.get('/orders/byCustomerId/' + $rootScope.customerId);
			
		// if orders ajax fails...
		p.error(function(err) {
			console.log('OrderMgmtController: addItem-getOrder ajax failed');
			console.log(err);
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
							'specInst': thing.specInst
						});
					}
				} else {
					holdingMap.push({
						'name': thing.name,
						'option': thing.option,
						'optionId': thing.optionId,
						'price': thing.price,
						'quantity': thing.quantity,
						'specInst': thing.specInst
					});
				}
			});
	
			res.data[0].things = holdingMap;
	
			var r = $http.put('/orders/' + res.data[0].id, res.data[0]);
	
			// if orders ajax fails...
			r.error(function(err) {
				console.log('OrderMgmtController: removeOption-put ajax failed');
				console.log(err);
				$modalInstance.dismiss('cancel');
			});
						
			// if orders ajax succeeds...
			r.then(function(res) {
				$rootScope.$broadcast('orderChanged');
				$modalInstance.dismiss('done');
			});
		});
	}
});


///
// Controllers: Splash
///
app.controller('SplashController', function($scope, $http, $rootScope) {
	var areaId = $rootScope.areaId;
	var areaName = $rootScope.areaName;
	var areaPhone = $rootScope.areaPhone;

	// Carousel
	// http://codepen.io/Fabiano/pen/LACzk
  $scope.myInterval = 3000;

	var p = $http.get('/restaurants/featured/' + areaId);

	p.error(function(err) {
		console.log('SplashController: restaurants ajax failed');
		console.log(err);
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
			console.log('SplashController: getItems-menus ajax failed');
			console.log(err);
		});

		r.then(function(res) {
			res.data.map(function(menu) {
				var s = $http.get('/items/byMenuId/' + menu.id);
		
				s.error(function(err) {
					console.log('SplashController: getItems-menus ajax failed');
					console.log(err);
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
	var areaId = $rootScope.areaId;

	var p = $http.get('/areas/' + areaId);

	p.error(function(err) {
		console.log('AboutController: areas ajax failed');
		console.log(err);
	});

	p.then(function(res) {
		$scope.area = res.data;
	});

});


///
// Controllers: Contact
///
app.controller('ContactController', function($scope, $http, $routeParams, $rootScope) {
	var areaId = $rootScope.areaId;

	var p = $http.get('/areas/' + areaId);

	p.error(function(err) {
		console.log('ContactController: areas ajax failed');
		console.log(err);
	});

	p.then(function(res) {
		$scope.area = res.data;
	});

});


///
// Controllers: Privacy
///
app.controller('PrivacyController', function($scope, $http, $routeParams, $rootScope) {
});


///
// Controllers: Restaurants
///

app.config(function(httpInterceptorProvider) {
	httpInterceptorProvider.register(/^\/restaurants/);
});

app.controller('RestaurantsController', function(
	messenger, $scope, $http, $routeParams,
	$modal, orderMgmt, $rootScope, screenMgr
) {
	var areaId = $rootScope.areaId;
	$scope.acHt = screenMgr.acHt;

	$scope.getUglySlug = function() {
		// retrieve restaurants
		var p = $http.get('/restaurants/byAreaId/' + areaId);
	
		// if restaurants ajax fails...
		p.error(function(err) {
			console.log('RestaurantsController: getUglySlug-restaurants ajax failed');
			console.log(err);
		});
	
		// if restaurants ajax succeeds...
		p.then(function(res) {
			var restLength = res.data.length;

			var randRestId = res.data[Math.floor((Math.random() * restLength))].id;

			var r = $http.get('/menus/byRestaurantId/' + randRestId);
			
			// if menus ajax fails...
			r.error(function(err) {
				console.log('RestaurantsController: getUglySlug-menus ajax failed');
				console.log(err);
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
			console.log('RestaurantsController: restaurants ajax failed');
			console.log(err);
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
					console.log('RestaurantsController: returnMenus ajax failed');
					console.log(err);
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
			console.log('RestaurantsController: getMenus ajax failed');
			console.log(err);
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
			console.log('RestaurantsController: getItems ajax failed');
			console.log(err);
		});

		// if items ajax succeeds...
		p.then(function(res) {
			var allItems = res.data;

			allItems.map(function(item) {
				var r = $http.get('/options/byItemId/' + item.id);
			
				// if options ajax fails...
				r.error(function(err) {
					console.log('RestaurantsController: getItems-options ajax failed');
					console.log(err);
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
			console.log('RestaurantsController: showRestaurant ajax failed');
			console.log(err);
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
			console.log('RestaurantsController: showMenu ajax failed');
			console.log(err);
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
	navMgr, messenger, pod, $scope,
	$http, $routeParams, $modal, orderMgmt,
	$rootScope
) {

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
	
	$scope.addItem = orderMgmt.add;

	$scope.removeItem = orderMgmt.remove;

	$rootScope.$on('orderChanged', function(evt, args) {
		$scope.updateOrder();
	});

	$scope.updateOrder = function() {
		var p = $http.get('/orders/byCustomerId/' + $rootScope.customerId);
		
		// if orders ajax fails...
		p.error(function(err) {
			console.log('OrderController: updateOrder ajax failed');
			console.log(err);
		});
				
		// if orders ajax succeeds...
		p.then(function(res) {
			// TODO properly get the only order that should be used
			// here, we're cheating by selecting the first (and only)
			if(res.data.length > 0) {
				$scope.customerOrderExists = true;
				$scope.orderStatus = parseInt(res.data[0].orderStatus);
				$scope.things = res.data[0].things;
				$scope.updateTotals(res.data[0]);
			} else {
				$scope.customerOrderExists = false;
			}
		});
	};

	$scope.updateTotals = function(order) {

		var things = order.things;

		var subtotal = 0;
		var tax = 0;
		// TODO this should be configged on the area level
		var taxRate = .05;
		var multiplier = 100;
		var deliveryFee = 12.95;
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

		total = (Math.round((subtotal + tax + deliveryFee + discount + gratuity) * 100)/100);

		$scope.subtotal = subtotal.toFixed(2);
		$scope.tax = tax.toFixed(2);
		$scope.deliveryFee = deliveryFee.toFixed(2);
		$scope.discount = discount.toFixed(2);
		$scope.gratuity = gratuity.toFixed(2);
		$scope.total = total.toFixed(2);

		order.subtotal = subtotal;
		order.tax = tax;
		order.deliveryFee = deliveryFee;
		order.discount = discount;
		order.total = total;

		var p = $http.put('/orders/' + order.id, order);
		
		// if orders ajax fails...
		p.error(function(err) {
			console.log('OrderController: updateOrder ajax failed');
			console.log(err);
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
						street: '',
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


app.controller('AccountController', function($scope, $http, $routeParams, $rootScope, $window) {
	if(!$rootScope.accessAccount) {
		$window.location.href = '/';
	}

	var customerId = $rootScope.customerId;

	var p = $http.get('/customers/' + customerId);

	p.error(function(err) {
		console.log('AccountController: customers ajax failed');
		console.log(err);
	});

	p.then(function(res) {
		$scope.customer = res.data;
	});

	var r = $http.get('/orders/byCustomerId/' + customerId);

	r.error(function(err) {
		console.log('AccountController: orders ajax failed');
		console.log(err);
	});

	r.then(function(res) {
		res.data.map(function(order) {
			order.updatedAt = order.updatedAt.substr(0,10);
			order.total = parseFloat(order.total).toFixed(2);
		});

		$scope.orders = res.data;
	});

	$scope.logOut = function() {
		console.log('logOut() called');
		$rootScope.$broadcast('customerLoggedOut');
	}

});

app.controller('AccountAddController', function(
	navMgr, messenger, pod, customerSchema,
	$scope, $http, $routeParams, $window, $rootScope
) {
		
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

			messenger.show('The account has been created.', 'Success!');

			if(options.addMore) {
				$scope.customer = {};
				return;
			}

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

