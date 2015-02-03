
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

	p.error(function(err) {
		console.log('SplashController: restaurants ajax failed');
		console.log(err);
	});

	p.then(function(res) {
		$scope.featuredRestaurants = [];
		$scope.restaurants = res.data;
		$scope.restaurants.forEach(function(restaurant) {
			// TODO these values need to come from a config
			var rotatorMin = 1;
			var rotatorMax = 3;
			restaurant.rotatorPanel = Math.floor(Math.random() * (rotatorMax - rotatorMin + 1)) + rotatorMin;
			$scope.getItems(restaurant.id, function(err, featuredItems) {
				var counter = 0;
				restaurant.itemImage1 = '';
				restaurant.itemId1 = '';
				restaurant.itemImage2 = '';
				restaurant.itemId2 = '';
				restaurant.itemImage3 = '';
				restaurant.itemId3 = '';
				restaurant.itemImage4 = '';
				restaurant.itemId4 = '';
				restaurant.itemImage5 = '';
				restaurant.itemId5 = '';
				restaurant.itemImage6 = '';
				restaurant.itemId6 = '';
				restaurant.itemImage7 = '';
				restaurant.itemId7 = '';
				restaurant.itemImage8 = '';
				restaurant.itemId8 = '';
				restaurant.itemImage9 = '';
				restaurant.itemId9 = '';
				restaurant.itemImage10 = '';
				restaurant.itemId10 = '';
				if(featuredItems.length > 9) {
					featuredItems.forEach(function(item) {
						counter ++;
						if(counter < 11) {
							if(restaurant.itemImage1.length < 1) {
								restaurant.itemImage1 = item.itemImage;
								restaurant.itemId1 = item.itemId;
							} else if(restaurant.itemImage2.length < 1) {
								restaurant.itemImage2 = item.itemImage;
								restaurant.itemId2 = item.itemId;
							} else if(restaurant.itemImage3.length < 1) {
								restaurant.itemImage3 = item.itemImage;
								restaurant.itemId3 = item.itemId;
							} else if(restaurant.itemImage4.length < 1) {
								restaurant.itemImage4 = item.itemImage;
								restaurant.itemId4 = item.itemId;
							} else if(restaurant.itemImage5.length < 1) {
								restaurant.itemImage5 = item.itemImage;
								restaurant.itemId5 = item.itemId;
							} else if(restaurant.itemImage6.length < 1) {
								restaurant.itemImage6 = item.itemImage;
								restaurant.itemId6 = item.itemId;
							} else if(restaurant.itemImage7.length < 1) {
								restaurant.itemImage7 = item.itemImage;
								restaurant.itemId7 = item.itemId;
							} else if(restaurant.itemImage8.length < 1) {
								restaurant.itemImage8 = item.itemImage;
								restaurant.itemId8 = item.itemId;
							} else if(restaurant.itemImage9.length < 1) {
								restaurant.itemImage9 = item.itemImage;
								restaurant.itemId9 = item.itemId;
							} else {
								restaurant.itemImage10 = item.itemImage;
								restaurant.itemId10 = item.itemId;
							}
						}
					});
					restaurant.featuredItems = featuredItems;
					$scope.featuredRestaurants.push(restaurant);
				}
			});
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
							frItems.push({'itemId': item.id, 'itemImage': item.image});
						}
					});
					callback(null, frItems);
				});
			});
		});
	};

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
	// TODO
	// get areaId
	var areaId = '54b32e4c3756f5d15ad4ca49';

	// TODO
	// get customerId
	$scope.customerId = '54c6644c0517463077a759aa';

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

	$scope.imageUrl = '/images';

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
		var firstRestId = allRestaurants[0].id;

		$scope.showRestaurant(firstRestId);

		allRestaurants.map(function(restaurant) {
			var r = $http.get('/menus/byRestaurantId/' + restaurant.id);
			
			// if menus ajax fails...
			r.error(function(err) {
				console.log('RestaurantsController: returnMenus ajax failed');
				console.log(err);
			});
		
			// if menus ajax succeeds...
			r.then(function(res) {
				restaurant.menus = res.data;
			});
		});

		$scope.restaurantId = allRestaurants[0].id;
		$scope.restaurantName = allRestaurants[0].name;
		$scope.restaurantImg = allRestaurants[0].image;

		$scope.restaurants = allRestaurants;

		$scope.getMenus($scope.restaurantId, true);
	});

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

	$scope.addOption = function(optionId, optionName, optionPrice, itemName) {

		var nextThing = {'optionId': optionId, 'option': optionName, 'price': optionPrice, 'name': itemName};

		var p = $http.get('/orders/byCustomerId/' + $scope.customerId);
		
		// if orders ajax fails...
		p.error(function(err) {
			console.log('RestaurantsController: addOption-get ajax failed');
			console.log(err);
		});
				
		// if orders ajax succeeds...
		p.then(function(res) {
			res.data[0].things.push(nextThing);
		
			var r = $http.put('/orders/' + res.data[0].id, res.data[0]);

			// if orders ajax fails...
			r.error(function(err) {
				console.log('RestaurantsController: addOption-put ajax failed');
				console.log(err);
			});
					
			// if orders ajax succeeds...
			r.then(function(res) {
				$scope.updateOrder();
			});
		});
	};


	$scope.removeOption = function(optionId) {
		var p = $http.get('/orders/byCustomerId/' + $scope.customerId);
		
		// if orders ajax fails...
		p.error(function(err) {
			console.log('RestaurantsController: removeOption-get ajax failed');
			console.log(err);
		});
				
		// if orders ajax succeeds...
		p.then(function(res) {
			
			var holdingMap = [];
			var counter = 0;
			var things = res.data[0].things;
			var hmSize = things.length;
			var cntnu = true;

			while(counter < hmSize & cntnu) {
				if(things[counter].optionId != optionId) {
					holdingMap.push({
					 	'name': res.data[0].things[counter].name,
					 	'option': res.data[0].things[counter].option,
					 	'optionId': res.data[0].things[counter].optionId,
					 	'price': res.data[0].things[counter].price
					});
				}
				counter ++;
			}

			res.data[0].things = holdingMap;

			var r = $http.put('/orders/' + res.data[0].id, res.data[0]);

			// if orders ajax fails...
			r.error(function(err) {
				console.log('RestaurantsController: removeOption-put ajax failed');
				console.log(err);
			});
					
			// if orders ajax succeeds...
			r.then(function(res) {
				$scope.updateOrder();
			});
		});
	};

	$scope.updateOrder = function() {
		var p = $http.get('/orders/byCustomerId/' + $scope.customerId);
		
		// if orders ajax fails...
		p.error(function(err) {
			console.log('RestaurantsController: updateOrder ajax failed');
			console.log(err);
		});
				
		// if orders ajax succeeds...
		p.then(function(res) {
			// TODO properly get the only order that should be used
			// here, we're cheating by selecting the first (and only)
			$scope.orderStatus = parseInt(res.data[0].orderStatus);
			$scope.things = res.data[0].things;
			$scope.updateTotals(res.data[0].things);
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
		$('#'+id).show();
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

	$scope.updateTotals = function(things) {

		var subtotal = 0;
		var tax = 0;
		// TODO this should be configged on the area level
		var taxRate = .05;
		var multiplier = 100;
		var deliveryFee = 12.95;
		var discount = 0;
		var total = 0;

		things.forEach(function(thing) {
			subtotal = (Math.round((subtotal + parseFloat(thing.price)) * 100)/100);
		});

		tax = (Math.round((subtotal * taxRate) * 100) / 100);

		total = (Math.round((subtotal + tax + deliveryFee + discount) * 100)/100);

		$scope.subtotal = subtotal;
		$scope.tax = tax;
		$scope.deliveryFee = deliveryFee;
		$scope.discount = discount;
		$scope.total = total;

	};

	$scope.updateOrder();
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

