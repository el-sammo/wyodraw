
var app = angular.module('app', [
	'ngRoute', 'ui.bootstrap', 'angularPayments',
	'angulartics', 'angulartics.google.analytics'
]);
var $ = jQuery;

///
// Configuration
///

app.config(['$httpProvider', '$analyticsProvider',
	function($httpProvider, $analyticsProvider) {
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

		// Records pages that don't use $state or $route
		$analyticsProvider.firstPageview(true);

		// Records full path
		$analyticsProvider.withAutoBase(true);
	}
]);

///
// Routes
///

app.config(function($routeProvider, $locationProvider) {
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
	// Account
	///

	$routeProvider.when('/account', {
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
	// Careers Page
	///

	$routeProvider.when('/careers', {
		controller: 'CareersController',
		templateUrl: '/templates/careers.html'
	});


	///
	// Cart
	///

	$routeProvider.when('/cart', {
		controller: 'OrderController',
		templateUrl: '/templates/orderPanelSmall.html'
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
	// Order
	///

	$routeProvider.when('/order/:id', {
		controller: 'OrderDetailsController',
		templateUrl: '/templates/orderDetails.html'
	});


	///
	// Order (small)
	///

	$routeProvider.when('/orderSmall/:id', {
		controller: 'OrderDetailsController',
		templateUrl: '/templates/orderDetailsSmall.html'
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
		templateUrl: '/templates/restaurantsList.html'
	});


	///
	// Terms Page
	///

	$routeProvider.when('/terms', {
		controller: 'TermsController',
		templateUrl: '/templates/terms.html'
	});


	///
	// Other
	///

	$routeProvider.otherwise({
		redirectTo: '/'
	});


	///
	// HTML5 Routing (no hash)
	///
	
	$locationProvider.html5Mode(true);
});


///
// Search Engine Optimization
///

app.service('seo', function() {
	var pages = {
		default: {
			title: 'Restaurant Delivery',
			description: '',
			// Prepend global keywords for all pages
			keywords: ['grub2you']
		},
		careers: {
			title: 'Careers',
			description: '',
			keywords: []
		}
	};

	var properties;
	var service = {
		title: function() {
			return properties.title;
		},
		description: function() {
			return properties.description;
		},
		keywords: function() {
			// Final global keywords for all pages
			var keywords = angular.copy(properties.keywords);
			keywords = keywords.concat([
				'grub to you', 'grubtoyou', 'grub 2 you'
			]);
			return keywords.join(', ');
		},
		reset: function() {
			service.setPage('default');
		},
		setTitle: function(title) {
			properties.title = 'Grub2You - ' + title;
		},
		setDescription: function(description) {
			properties.description = description;
		},
		appendKeywords: function(keywords) {
			if(! _.isArray(keywords)) {
				keywords = [keywords];
			}
			properties.keywords = properties.keywords.concat(keywords);
		},
		setPage: function(page) {
			properties = angular.copy(pages[page] || pages.default);
			properties.title = 'Grub2You - ' + properties.title;
		}
	};
	service.reset();
	return service;
});

app.controller('SeoController', function($scope, seo) {
	$scope.seo = seo;
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
// Querystring builder
///
	
app.factory('querystring', function querystringFactory() {
	var service = {
		stringify: function(query, noEncode) {
			var items = [];
			angular.forEach(query, function(value, key) {
				if(noEncode) {
					items.push(key + '=' + value);
				} else {
					items.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
				}
			});
			return items.join('&');
		}
	};
	return service;
});


///
// Configuration managements
///
	
app.factory('configMgr', function configMgrFactory() {
	var service = {
		config: {
			vendors: {
				googleMaps: {
					key: 'AIzaSyCmRFaH2ROz5TueD8XapBCTAdBppUir_Bs'
				}
			}
		},
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
// Responsive Layout Manager
///

app.constant('bigScreenWidth', 1179);

app.factory('deviceMgr', function($window, bigScreenWidth) {
	var service = {
		getWindowWidth: function() {
			return $($window).width();
		},

		isBigScreen: function(width) {
			width || (width = service.getWindowWidth());
			return width >= bigScreenWidth;
		}
	};

	return service;
});

app.directive('smallScreen', function($window, deviceMgr) {
	return function ($scope, element, args) {
		$scope.$watch(deviceMgr.getWindowWidth, function(width) {
			if(deviceMgr.isBigScreen()) {
				return $(element).hide();
			}
			$(element).show();
		}, true);

		angular.element($window).bind('resize', function() {
			$scope.$apply();
		});
	}
});

app.directive('bigScreen', function($window, bigScreenWidth) {
	return function ($scope, element, args) {
		$scope.$watch(deviceMgr.getWindowWidth, function(width) {
			if(! deviceMgr.isBigScreen()) {
				return $(element).hide();
			}
			$(element).show();
		}, true);

		angular.element($window).bind('resize', function() {
			$scope.$apply();
		});
	}
});

app.directive('manageHeight', function($window, bigScreenWidth) {
	function getWindowHeight() {
		return $($window).height();
	}

	function getWindowWidth() {
		return $($window).width();
	}

	function resizeElement(el, newHt) {
		var adjHt = newHt - 266;
		$(el).height(adjHt);
	}

	function clearSize(el) {
		$(el).height('');
	}

	function doNotManage() {
		return getWindowWidth() < bigScreenWidth;
	}

	return function ($scope, element, args) {
		function manageSize(height) {
			height = (args.manageHeight === 'order' ? height - 52 : height);
			resizeElement(element, height);
		}

		$scope.$watch(getWindowHeight, function(height) {
			if(doNotManage()) return;
			
			manageSize(height);
		}, true);

		$scope.$watch(getWindowWidth, function(width) {
			if(doNotManage()) {
				return clearSize(element);
			}

			manageSize(getWindowHeight());
		}, true);

		angular.element($window).bind('resize', function() {
			$scope.$apply();
		});
	}
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

app.controller('LoadServices', function(errMgr, fakeAuth, sessionMgr) {});

app.factory('sessionMgr', function($rootScope, $http, $q) {
	var service = {
		getSession: function() {
			return $http.get('/customers/session').then(function(sessionRes) {
				if(! (sessionRes && sessionRes.data)) {
					return $q.reject(
						'Invalid session response: ' + JSON.stringify(sessionRes)
					);
				}
				return sessionRes.data;

			}).catch(function(err) {
				console.error(err);
				$q.reject(err);
			});
		}
	};

	return service;
});


app.factory('delFeeMgmt', function($rootScope, $http) {
	// [tierOne, tierTwo, tierThree, additional]
	// maps to
	// [
	// 	450 seconds or less, 
	// 	720 seconds or less but greater than 450 seconds,
	// 	greater than 720 seconds,
	// 	each additional restaurant
	// 	]
	var service = [7.95, 10.95, 13.95, 3.50];

	return service;
});


app.factory('promoMgmt', function($rootScope, $http) {
	var service = {
		getPromo: function(currentDelFee, promoCode, customerId) {
			return $http.post('/promos/getPromo', {
				currentDelFee: currentDelFee, promoCode: promoCode, customerId: customerId
			});
		}
	}

	return service;
});


app.factory('hoursMgr', function($rootScope, $http, $q, clientConfig, areaMgmt) {
	var service = {
		getDeliveryHours: function() {
			var area = areaMgmt.getArea();
			var areaName = area.name;

			return $http.get('/areas/byName/' + areaName).then(function(res) {
				return getHours(res.data[0]);
			}).catch(function(err) {
				console.log('hoursMgr: areas ajax failed');
				console.error(err);
				$q.reject(err);
			});
		},

		getAllHours: function() {
			var area = areaMgmt.getArea();
			var areaName = area.name;

			return $http.get('/areas/byName/' + areaName).then(function(res) {
				return res.data[0].hours;
			}).catch(function(err) {
				console.log('hoursMgr: areas ajax failed');
				console.error(err);
				$q.reject(err);
			});
		}
	};

	var getHours = function(area) {
			var today = new Date().getDay();

		return todayHours = area.hours[today];
	};

	return service;
});

app.factory('areaMgmt', function($rootScope) {
	var service = {
		getArea: function() {
			/**
			 * TODO - Make areas work, and test thoroughly
			 *
				var winLocStr = location.hostname;
				var winLocPcs = winLocStr.split('.');

				if(winLocPcs[0] === 'grub2you' || winLocPcs[0] === 'www') {
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
					var areaName;
					if(clientConfig.environment == 'development') {
						areaName = 'casper';
					} else {
						areaName = winLocPcs[0];
					}
					var p = $http.get('/areas/byName/' + areaName);
						
					// if areas ajax fails...
					p.error(function(err) {
						console.log('fakeAuthFactory: areas ajax failed');
						console.error(err);
					});
								
					// if areas ajax succeeds...
					p.then(function(res) {
						$rootScope.areaId = res.data[0].id;
						$rootScope.areaName = res.data[0].name;
						$rootScope.areaPhone = res.data[0].phone;
					});

				}
			*/

			var area = {
				id: '54b32e4c3756f5d15ad4ca49',
				name: 'Casper',
				phone: '234-GRUB'
			};

			$rootScope.areaId = area.id;
			$rootScope.areaName = area.name;
			$rootScope.areaPhone = area.phone;

			return area;
		}
	};

	return service;
});

app.factory('fakeAuth', function($rootScope, $http, clientConfig, areaMgmt) {
	areaMgmt.getArea();

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

app.factory('layoutMgmt', function layoutMgmtFactory(
	$modal, $rootScope, $http
) {
	var service = {
		logIn: function() {
			$modal.open({
				templateUrl: '/templates/login.html',
				backdrop: true,
				controller: 'LayoutMgmtController'
			});
		},
		logOut: function() {
			$modal.open({
				templateUrl: '/templates/logout.html',
				backdrop: true,
				controller: 'LayoutMgmtController'
			});
		},
		signUp: function() {
			$modal.open({
				templateUrl: '/templates/signUp.html',
				backdrop: true,
				controller: 'SignUpController'
			});
		},
		feedback: function() {
			$modal.open({
				templateUrl: '/templates/feedback.html',
				backdrop: true,
				controller: 'LayoutMgmtController'
			});
		}
	};
	return service;
});


///
// Signup
///

app.factory('signupPrompter', function signupPrompterFactory(
	sessionMgr, layoutMgmt
) {
	var hasPrompted = false;
	var service = {
		prompt: function() {
			if(hasPrompted) return;
			hasPrompted = true;

			sessionMgr.getSession().then(function(sessionData) {
				if(sessionData.customerId) return;
				layoutMgmt.signUp();
			});
		}
	};
	return service;
});

app.controller('SignUpController', function(
	$scope, $modalInstance, $http,
	$rootScope, $window, clientConfig,
	layoutMgmt
) {

	$scope.haveAccount = function() {
		$modalInstance.dismiss('cancel');
		layoutMgmt.logIn();
	};


	var b = $http.get('/areas/');

	// if areas ajax fails...
	b.error(function(err) {
		console.log('SignUpController: areas ajax failed');
		console.error(err);
	});
	
	b.then(function(res) {
		$scope.areas = res.data;

		if($scope.areas && $scope.areas.length === 1) {
			$scope.selArea = _.first($scope.areas).id;
		}
	});

	$scope.dyk = 'You can order from multiple restaurants on the same order? One person wants steak, another Italian and yet another ribs? We can deliver an order from any combination of restaurants!';
	$http.get('/dyk/').then(function(res) {
		$scope.dyk = res.data[Math.floor((Math.random() * res.data.length))].dykContent;
	});

	$scope.validUsername = true;

	$scope.state = clientConfig.defaultState || 'WY';

	$scope.step = 0;
	$scope.submitted = 0;

	$scope.required = function(field, step) {
		if($scope.submitted <= step || field) return;
	 	return 'error';
	};

	$scope.requiredAddress = function(field, step) {
		if($scope.submitted <= step) return '';
		if(field && isValidAddress(field)) return '';
	 	return 'error';
	};

	$scope.usernameSearch = function() {
		if($scope.username === '') return;

		var s = $http.get('/customers/byUsername/' + $scope.username);
					
		// if customers ajax fails...
		s.error(function(err) {
			console.log('layoutMgmt: sut-customersGet ajax failed');
			console.error(err);
		});
	
		s.then(function(res) {
			$scope.validUsername = ! (res.data.length > 0);
		});
	};

	$scope.startAccount = function() {
		$scope.submitted = 1;
		if(! $scope.isFormComplete(0)) return;

		var customer = {
			email: $scope.email,
			username: $scope.username,
			areaId: $scope.selArea
		}

		$http.post('/starterAccounts/create', customer).then(function(data) {
			$scope.step = 1;
		}).catch(function(err) {
			console.log('layoutMgmt: sut-customersGet ajax failed');
			console.error(err);
		});
	};

	function splitAddress(address) {
		var addrInfo = {
			streetNumber: '',
			streetName: ''
		};
		var matches = address.match(/^([0-9]+) (.+)/);
		if(matches) {
			addrInfo.streetNumber = matches[1];
			addrInfo.streetName = matches[2];
		}
		return addrInfo;
	}

	function isValidAddress(address) {
		if(! address) return false;

		var addrInfo = splitAddress($scope.address);
		return addrInfo.streetNumber && addrInfo.streetName;
	};

	$scope.isFormComplete = function(step) {
		var reqFields = {
			0: ['email', 'username', 'password'],
			1: ['fName', 'lName', 'phone', 'address', 'city', 'state', 'zip']
		};

		if(! reqFields[step]) return true;

		var isComplete = true;
		reqFields[step].forEach(function(fieldName) {
			isComplete = isComplete && $scope[fieldName];
		});

		if($scope.step > 0) {
			isComplete = isComplete && isValidAddress($scope.address);
		}

		return isComplete;
	};

	$scope.createAccount = function() {
		$scope.submitted = 2;

		if(! $scope.isFormComplete(1)) {
			return;
		}

		var addrInfo = splitAddress($scope.address);

		var customer = {
			areaId: $scope.selArea,
			fName: $scope.fName,
			lName: $scope.lName,
			addresses: {
				primary: {
					streetNumber: addrInfo.streetNumber,
					streetName: addrInfo.streetName,
					apt: $scope.apt,
					city: $scope.city,
					state: $scope.state,
					zip: $scope.zip
				}
			},
			username: $scope.username,
			password: $scope.password,
			phone: $scope.phone,
			email: $scope.email,
			sawBevTour: false
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
				$http.post('/mail/sendConfirmationToCustomer/'+data.id);
		 	} else {
				$modalInstance.dismiss('done');
				$scope.submit({username: customer.username, password: customer.password, customerId: data.id});
			}
		}).error(function(err) {
			// if customers ajax fails...
				console.log('LayoutMgmtController: customer-create ajax failed');
				console.error(err);
				$modalInstance.dismiss('cancel');
		});
	};

	$scope.submit = function(credentials) {
		$http.post(
			'/login', credentials
		).success(function(data, status, headers, config) {
			// if login ajax succeeds...
			if(status >= 400) {
				$rootScope.$broadcast('customerLoggedIn', data.customerId);
				$modalInstance.dismiss('done');
			} else if(status == 200) {
				$rootScope.$broadcast('customerLoggedIn', data.customerId);
				$modalInstance.dismiss('done');
		 	} else {
				$rootScope.$broadcast('customerLoggedIn', data.customerId);
				$modalInstance.dismiss('done');
			}
		}).error(function(err) {
			// if login ajax fails...
			console.log('LayoutMgmtController: logIn ajax failed');
			console.error(err);
			$modalInstance.dismiss('cancel');
		});
	};

});


///
// Slug Management
///

app.factory('slugMgr', function(
	$rootScope, $http, $q
) {
	var slug;

	var service = {
		randomSlug: function() {
			if(slug) return $q.when(slug);

			var areaId = $rootScope.areaId;

			// retrieve restaurants
			return $http.get('/restaurants/byAreaId/' + areaId).then(function(res) {
				if(slug) return slug;

				// if restaurants ajax succeeds...
				var restLength = res.data.length;

				var randRestId = res.data[Math.floor((Math.random() * restLength))].id;

				return $http.get('/menus/byRestaurantId/' + randRestId);

			}).then(function(res) {
				if(slug) return slug;

				// if menus ajax succeeds...
				var menuLength = res.data.length;

				slug = res.data[Math.floor((Math.random() * menuLength))].slug;
				return slug;

			}).catch(function(err) {
				// if restaurants ajax fails...
				console.error('randomSlug error during ajax call:', err);
			});
		}
	};

	return service;
});


///
// Layout Management
///

app.controller('LayoutMgmtController', function(
	$scope, $modalInstance,	$http,
	$rootScope, $window, layoutMgmt,
	messenger, deviceMgr
) {

	var p = $http.get('/areas/');

	$scope.badCreds = false;
						
	// if areas ajax fails...
	p.error(function(err) {
		console.log('layoutMgmt: areas ajax failed');
		console.error(err);
	});
								
	// if areas ajax succeeds...
	p.then(function(res) {
		$scope.areas = res.data;
	});

	$scope.areaName = $rootScope.areaName;
	$scope.accessAccount = $rootScope.accessAccount;

	$scope.credentials = {};

	$scope.required = function(field) {
		if(! $scope.submitted || field) return;
	 	return 'error';
	};

	$scope.noAccount = function() {
		$modalInstance.dismiss('cancel');
		layoutMgmt.signUp($scope.areas);
	};

	$scope.submit = function(credentials) {
		$http.post(
			'/login', credentials
		).success(function(data, status, headers, config) {
			// if login ajax succeeds...
			if(status >= 400) {
				$rootScope.$broadcast('customerLoggedIn', data.customerId);
				$modalInstance.dismiss('done');
			} else if(status == 200) {
				$rootScope.$broadcast('customerLoggedIn', data.customerId);
				$modalInstance.dismiss('done');
		 	} else {
				$rootScope.$broadcast('customerLoggedIn', data.customerId);
				$modalInstance.dismiss('done');
			}
		}).error(function(err) {
			console.log('we were NOT successful here - 1');
			// if login ajax fails...
			$scope.badCreds = true;
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
				console.log('LayoutMgmtController: logOut ajax failed');
				console.error(err);
				$modalInstance.dismiss('cancel');
		});
	}

	$scope.sendFeedback = function() {
		var feedback = {};
		feedback.areaName = $scope.areaName;
		feedback.email = $scope.email;
		feedback.feedback = $scope.feedback;
		feedback.name = $scope.name;

		$http.post('/feedback/create', feedback).then(function(res) {
			$modalInstance.dismiss('done');
			if(deviceMgr.isBigScreen()) {
				messenger.show('Your feedback has been received.', 'Success!');
			}
			$http.post('/mail/sendFeedbackToManagement/'+res.data.id);
		});
	}

});


///
// Layout Controller
///


app.controller('LayoutController', function(
	navMgr, pod, $scope,
	$http, $routeParams, $modal, layoutMgmt,
	$rootScope, sessionMgr, hoursMgr
) {
	var sessionPromise = sessionMgr.getSession();

	$scope.showMenu = false;

	$scope.menuClicked = function(forceValue) {
		if(! _.isUndefined(forceValue)) {
			$scope.showMenu = forceValue;
			return;
		}
		$scope.showMenu = !$scope.showMenu;
	}

	sessionPromise.then(function(sessionData) {
		if(sessionData.customerId) {
			$scope.accessAccount = true;
			$scope.customerId = sessionData.customerId;
		}

		$scope.logIn = layoutMgmt.logIn;
		$scope.logOut = layoutMgmt.logOut;
		$scope.signUp = layoutMgmt.signUp;
		$scope.feedback = layoutMgmt.feedback;
	});

	$rootScope.$on('customerLoggedIn', function(evt, args) {
		$scope.accessAccount = true;
		$scope.customerId = args;
		$rootScope.$broadcast('orderChanged');
	});

});

///
// Order Management
///

app.factory('orderMgmt', function($modal, $rootScope, $http) {
	var service = {
		checkout: function(order) {
			$modal.open({
				templateUrl: '/templates/checkout.html',
				backdrop: true,
				controller: 'CheckoutController',
				resolve: {
					args: function() {
						return {
							order: order
						}
					}
				}
			});
		},
		checkoutProhibited: function(order) {
			$modal.open({
				templateUrl: '/templates/checkoutProhibited.html',
				backdrop: true,
				controller: 'CheckoutController',
				resolve: {
					args: function() {
						return {
							order: order
						}
					}
				}
			});
		},
		delFeeExp: function(things, delFee) {
			$modal.open({
				templateUrl: '/templates/deliveryFeeExplained.html',
				backdrop: true,
				controller: 'ExplainerController',
				resolve: {
					args: function() {
						return {
							things: things,
							delFee: delFee
						}
					}
				}
			});
		},
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


app.controller('CheckoutController', function(
	$scope, $modalInstance, $http, $rootScope, $location,
	$timeout, args, messenger, accountMgmt, layoutMgmt,
	clientConfig, payMethodMgmt, delFeeMgmt, $window,
	deviceMgr, hoursMgr, bigScreenWidth, promoMgmt
) {

//	if(!$scope.order || !$scope.order.customerId) {
//		$modalInstance.dismiss('cancel');
//	}

	var delHoursPromise = hoursMgr.getDeliveryHours();

	delHoursPromise.then(function(delHours) {
		var now = new Date().getHours();
		$scope.currentlyAvailable = false;

		delHours.forEach(function(hours) {
			if(hours.start > 11) {
				var todayStart = (parseInt(hours.start) - 12) + 'pm';
				var todayEnd = (parseInt(hours.end) - 12) + 'pm';
			} else {
				var todayStart = parseInt(hours.start) + 'am';
				var todayEnd = parseInt(hours.end) + 'am';
			}
		
			$scope.todayStart = todayStart;
			$scope.todayEnd = todayEnd;
			
			if(hours.end > 11) {
				var todayEnd = (parseInt(hours.end) - 12) + 'pm';
			} else {
				var todayEnd = parseInt(hours.end) + 'am';
			}
			
			$scope.todayEnd = todayEnd;

			var starting = (parseInt(hours.start) - 1);
			var ending = parseInt(hours.end);
			
			if(now >= starting && now <= ending) {
				$scope.currentlyAvailable = true;
			}
		});

	});
			
	// this exists to not process further if checkout is prohibited
	if(!args.order) {
		$modalInstance.dismiss('cancel');
		return;
	}

	$scope.clientConfig = clientConfig;
	$scope.order = args.order;
	$scope.validCode = true;
	$scope.effect;
	$scope.payMethod = {};

	function redactCC(lastFour) {
		return 'XXXX-XXXX-XXXX-' + lastFour;
	}

	$scope.addPM = function() {
		var paymentData = {
			cardNumber: $scope.payMethod.cardNumber.toString(),
			expirationDate: $scope.payMethod.year + '-' + $scope.payMethod.month,
			cvv2: $scope.payMethod.cvv2
		};

		payMethodMgmt.addPM(paymentData).then(function(customer) {
			var payMethod = _.last(customer.paymentMethods);
			var pos = $scope.checkoutPaymentMethods.length - 2;
			$scope.checkoutPaymentMethods.splice(pos, 0, {
				id: payMethod.id,
				lastFour: redactCC(payMethod.lastFour)
			});
			$scope.selMethod = payMethod.id;
		}).catch(function(err) {
			if(err.duplicateCustomerProfile && err.duplicateCustomerProfileId > 0) {
				$scope.customer.aNetProfileId = err.duplicateCustomerProfileId;
				$http.put('/customers/' + $scope.customer.id, $scope.customer).then($scope.addPM);
			}
			if(err.duplicatePaymentProfile) {
				if($($window).width() > bigScreenWidth) {
					console.log('showBig');
					$window.location.href = '/app/';
				} else {
					console.log('showSmall');
					$window.location.href = '/app/cart/';
				}
			}
		});
	};

	var p = $http.get('/customers/' + $scope.order.customerId);
		
	// if orders ajax fails...
	p.error(function(err) {
		console.log('OrderMgmtController: checkout-getCustomer ajax failed');
		console.error(err);
		$modalInstance.dismiss('cancel');
	});
							
	// if orders ajax succeeds...
	p.then(function(res) {
		var paymentMethods = res.data.paymentMethods || [];
		paymentMethods.forEach(function(payMethod) {
			payMethod.lastFour = redactCC(payMethod.lastFour);
		});
		paymentMethods.push({id: 'cash', lastFour: 'Cash'});
		paymentMethods.push({id: 'newCard', lastFour: 'New Credit Card'});
		$scope.checkoutPaymentMethods = paymentMethods;

		$scope.customer = res.data;
	});

	$scope.updateTotal = function() {
		var total = (parseFloat($scope.order.subtotal) + parseFloat($scope.order.tax)).toFixed(2);
		var gratuity = 0;
		var currentDelFee = delFeeMgmt[0];
		if($scope.order.deliveryFee) {
			currentDelFee = $scope.order.deliveryFee;
		}
		var currentTotal;

		if($scope.gratuity) {
			gratuity = parseFloat($scope.gratuity);
		}

		if($scope.promo) {
			var promoCode = $scope.promo;
			promoMgmt.getPromo(currentDelFee, promoCode, $scope.customer.id).then(function(feeDataObj) {
				var feeData = feeDataObj.data;
				if(feeData.success) {
					$scope.validCode = true;
					$scope.promoAmount = feeData.amount;
					var newDelFee = $scope.promoAmount;

					if(feeData.effect == 'reduce') {
						$scope.codeEffect = 'Your delivery fee has been reduced by $' + (parseFloat($scope.order.deliveryFee) - parseFloat(newDelFee)).toFixed(2) + '!';
					} else {
						$scope.codeEffect = 'Your delivery fee has been reduced to $' + (parseFloat(newDelFee)).toFixed(2) + '!';
					}

					currentTotal = (parseFloat(total) + parseFloat(gratuity) + parseFloat(newDelFee)).toFixed(2);
					$scope.currentTotal = currentTotal;
				} else {
					$scope.validCode = false;
					$scope.reason = feeData.reason;

					currentTotal = (parseFloat(total) + parseFloat(gratuity) + parseFloat(currentDelFee)).toFixed(2);
					$scope.currentTotal = currentTotal;
				}
			});
		} else {
			currentTotal = (parseFloat(total) + parseFloat(gratuity) + parseFloat(currentDelFee)).toFixed(2);
			$scope.currentTotal = currentTotal;
		}
	}

	$scope.updateTotal();

	$scope.checkout = function() {
		$scope.paymentFailed = false;
		$scope.order.specDelInstr = $scope.specDelInstr;
		$scope.order.areaId = $rootScope.areaId;
		$scope.order.paymentInitiatedAt = new Date().getTime();

		var thisGratuity = 0;
		var thisPromoCode = 'nopromocodespecified';
		var thisSpecDelInstr = 'nospecdelinstrspecified';
		
		if($scope.gratuity) {
			thisGratuity = $scope.gratuity;
		}

		if($scope.promo) {
			thisPromoCode = $scope.promo;
		}

		if($scope.specDelInstr) {
			thisSpecDelInstr = $scope.specDelInstr;
		}

		if($scope.selMethod == 'cash') {
			$http.post('/checkout/processCashPayment', {
				order: $scope.order,
				gratuity: thisGratuity,
				promoCode: thisPromoCode,
				specDelInstr: thisSpecDelInstr
			}).then(function(res) {
				if(res.data.success) {
					if(res.data.msg === 'order-put-cash') {
						if(order) {
							order.orderStatus = 5;
							order.paymentAcceptedAt = new Date().getTime();
							console.log('backup order update for order: '+res.data.orderId);
							console.log(order);
							$http.put('/orders/' + order.id, order);
						} else {
							console.log('backup order update failed');
						}
					}
					$rootScope.$broadcast('orderChanged');
					// notify operator
					$http.post('/mail/sendNotifyToOperator/'+$scope.order.customerId);
					// notify customer
					$http.post('/mail/sendOrderToCustomer/'+$scope.order.customerId);
					$modalInstance.dismiss('done');
					if(deviceMgr.isBigScreen()) {
						$window.location.href = '/app/order/' + $scope.order.id;
						messenger.show('Your order has been received.', 'Success!');
					} else {
						$window.location.href = '/app/orderSmall/' + $scope.order.id;
					}
				} else {
					$scope.paymentFailed = true;
					var failMsg = 'Application error.';
					$scope.failMsg = failMsg;
				}
			});
		} else {
			$http.post('/checkout/processCCPayment', {
				order: $scope.order,
				paymentMethodId: $scope.selMethod,
				gratuity: thisGratuity,
				promoCode: thisPromoCode,
				specDelInstr: thisSpecDelInstr
			}).then(function(res) {
				if(res.data.success) {
					if(res.data.msg === 'order-put-with-approval') {
						if(order) {
							order.orderStatus = 5;
							order.paymentAcceptedAt = new Date().getTime();
							console.log('backup order update for order: '+res.data.orderId);
							console.log(order);
							$http.put('/orders/' + order.id, order);
						} else {
							console.log('backup order update failed');
						}
					}
					$rootScope.$broadcast('orderChanged');
					// notify operator
					$http.post('/mail/sendNotifyToOperator/'+$scope.order.customerId);
					// notify customer
					$http.post('/mail/sendOrderToCustomer/'+$scope.order.customerId);
					$modalInstance.dismiss('done');

					var redirectTo = '/orderSmall/' + $scope.order.id;
					if(deviceMgr.isBigScreen()) {
						redirectTo = '/order/' + $scope.order.id;
					}

					$location.path(redirectTo);
					messenger.show('Your order has been received.', 'Success!');
				} else {
					console.log('   ');
					console.log('   ');
					console.log('   ');
					console.log('paymentFailure:');
					console.log('   ');
					console.log(res.data.msg+' for order '+res.data.orderId);
					console.log('   ');
					console.log('   ');
					console.log('   ');
					$scope.paymentFailed = true;
					var failMsg = 'Payment error.';
					if(res.data.msg === 'order-put-with-failure') {
						failMsg = 'Payment failed.';
					}
					if(res.data.msg === 'order-put-with-no-processing') {
						failMsg = 'Payment processing error.';
					}
					$scope.failMsg = failMsg;
				}
			});
		}
	}
});


app.controller('OrderMgmtController', function(
	args, $scope, $modalInstance, $http, $rootScope, sessionMgr, $q
) {
	$scope.item = args.item;
	$scope.thing = args.thing;
	$scope.specInst = '';
	$scope.quantity = 1;
	$scope.selOption = '';

	$scope.orderCompleted = false;

	// If there's only one option, auto-choose it
	if($scope.item && $scope.item.options && $scope.item.options.length === 1) {
		$scope.selOption = _.first($scope.item.options).id;
	}

	$scope.addItemOption = function() {
		var sessionPromise = sessionMgr.getSession();
	
		sessionPromise.then(function(sessionData) {

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

				if(! order.orderStatus) {
					if(sessionData.customerId) {
						order = {
							customerId: sessionData.customerId,
							areaId: $rootScope.areaId,
							orderStatus: parseInt(1),
							sessionId: sessionData.sid,
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

			var order;
		 	if(sessionData.order) {
				order	= sessionData.order;
			} else {
				order = {};
			}

			// Controls that prevent an item from being added to
			// an order that has achieved order status 5 or more
			if(order.orderStatus && (parseInt(order.orderStatus) > 4)) {
				console.log('attempting to add item to completed order...');
				$scope.orderCompleted = true;
				return;
			}

			if(!order.customerId && sessionData.customerId) {
				order.customerId = sessionData.customerId;
			}

			var method = 'post';
			var url = '/orders/create';

			if(order.orderStatus) {
				method = 'put';
				url = '/orders/' + order.id;
			}

			buildOrder(order).then(function(order) {
				$http[method](url, order).then(function(res) {
					$rootScope.$broadcast('orderChanged');
					$modalInstance.dismiss('done');
				}).catch(function(err) {
					console.log('OrderMgmtController: Save order failed - ' + method + ' - ' + url);
					console.error(err);
					$modalInstance.dismiss('cancel');
				});
			});
		});
	};

	$scope.removeThing = function() {
		var sessionPromise = sessionMgr.getSession();
	
		sessionPromise.then(function(sessionData) {
			sessionData || (sessionData = {});
			sessionData.order || (sessionData.order = {});
			sessionData.order.things || (sessionData.order.things = []);

			var things = sessionData.order.things;

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
	
			sessionData.order.things = holdingMap;
	
			var r = $http.put('/orders/' + sessionData.order.id, sessionData.order);
	
			// if orders ajax fails...
			r.catch(function(err) {
				console.log('OrderMgmtController: removeOption-put ajax failed');
				console.error(err);
				$modalInstance.dismiss('cancel');
			});
						
			// if orders ajax succeeds...
			r.then(function(res) {
				$rootScope.$broadcast('orderChanged');
				$modalInstance.dismiss('done');
			});
		});
	};

	$scope.getRestaurant = function(optionId) {
		return $q(function(resolve, reject) {
			var r = $http.get('/options/' + optionId);
				
			r.error(function(err) {
				console.log('OrderMgmtController: getRestaurantName-options ajax failed');
				console.error(err);
				reject(err);
			});
				
			r.then(function(res) {
				var s = $http.get('/items/' + res.data.itemId);
					
				s.error(function(err) {
					console.log('OrderMgmtController: getRestaurantName-items ajax failed');
					console.error(err);
					reject(err);
				});
					
				s.then(function(res) {
					var t = $http.get('/menus/' + res.data.menuId);
						
					t.error(function(err) {
						console.log('OrderMgmtController: getRestaurantName-menus ajax failed');
						console.error(err);
						reject(err);
					});
						
					t.then(function(res) {
						var u = $http.get('/restaurants/' + res.data.restaurantId);
							
						u.error(function(err) {
							console.log('OrderMgmtController: getRestaurantName-restaurants ajax failed');
							console.error(err);
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
// Payment Method Management
///

app.factory('payMethodMgmt', function($q, $http, sessionMgr) {
	var service = {
		addPM: function(paymentData) {
			var scope = {};

			return sessionMgr.getSession().then(function(sessionData) {
				if(!sessionData.customerId) {
					// TODO Handle condition (or delete this section if it makes
					// the most sense)
					return;
				}

				scope.customerId = sessionData.customerId;
				return $http.get('/customers/' + scope.customerId);

			}).then(function(res) {
				scope.customer = res.data;
		
				if(scope.customer.aNetProfileId) {
					return;
				}

				return $http.post('/customers/createANet', {
					customerId: scope.customer.id
				}).then(function(res) {
					scope.customer.aNetProfileId = res.data.customerProfileId;

					return $http.put('/customers/' + scope.customer.id, scope.customer);
					// assuming that customers update was successful - no catch for ajax failure
				});
				// assuming that createANet was successful - no catch for aNet failure

			}).then(function() {
				paymentData.customerProfileId = scope.customer.aNetProfileId;

				if(! scope.customer.paymentMethods) {
					scope.customer.paymentMethods = [];
				}

				return $http.post('/customers/createPaymentMethod', paymentData);
				// assuming that createPaymentMethod was successful - no catch for aNet failure

			}).then(function(res) {
				scope.customer.paymentMethods.push({
					lastFour: res.data.lastFour,
					id: res.data.customerPaymentProfileId,
					active: true,
					expires: res.data.expires,
					cvv2: res.data.cvv2
				});

				return $http.put('/customers/' + scope.customer.id, scope.customer);
				// assuming that customers update was successful - no catch for ajax failure

			}).then(function(res) {
				return scope.customer;

			}).catch(function(err) {
				if(err.data.error.message.match(/duplicate record with ID/)) {
					var msgPcs = err.data.error.message.split('ID');
					var customerProfileId = parseInt(msgPcs[1]);
					err.duplicateCustomerProfile = true;
					err.duplicateCustomerProfileId = customerProfileId;
				}
				if(err.data.error.message.match(/duplicate customer payment profile/)) {
					err.duplicatePaymentProfile = true;
				}
				return $q.reject(err);
			});
		}
	};

	return service;
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
	args, $scope, $modalInstance, $http, $rootScope, messenger
) {
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
			console.log('CareersMgmtController: applicants-create ajax failed');
			console.error(err);
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
			console.log('CareersMgmtController: applicants-create ajax failed');
			console.error(err);
			$modalInstance.dismiss('cancel');
		});
	};
});


///
// Controllers: Tester
///
app.controller('TesterController', function($scope, $http, $rootScope, $q, testerMgmt) {
	var areaId = $rootScope.areaId;
	$scope.apply = testerMgmt.apply;

});


///
// Controllers: About
///
app.controller('AboutController', function(
	$scope, $http, $routeParams, $rootScope, 
	delFeeMgmt, hoursMgr
) {
	var areaId = $rootScope.areaId;

	var dayMap = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];

	var delHoursPromise = hoursMgr.getAllHours();
	
	delHoursPromise.then(function(delHours) {
		var hoursArr = [];
		var counter = 0;
		delHours.forEach(function(day) {
			var windows = [];
			day.forEach(function(thisWindow) {
				windows.push(thisWindow.start, thisWindow.end);
			});
			hoursArr.push({'dotw': dayMap[counter], windows: windows});
			counter ++;
		});

		$scope.days = hoursArr;

		$scope.tierOne = '$' + delFeeMgmt[0];
		$scope.tierTwo = '$' + delFeeMgmt[1];
		$scope.tierThree = '$' + delFeeMgmt[2];
		$scope.addRestaurant = '$' + (delFeeMgmt[3]).toFixed(2);
	
		$http.get('/areas/' + areaId).then(function(res) {
			$scope.area = res.data;
		}).catch(function(err) {
			console.log('AboutController: areas ajax failed');
			console.error(err);
		});
	});
});


///
// Controllers: Careers
///
app.controller('CareersController', function(
	$scope, $http, $routeParams, $rootScope, careersMgmt, seo
) {
	seo.setPage('careers');

	var areaId = $rootScope.areaId;

	$scope.apply = careersMgmt.apply;

	var p = $http.get('/areas/' + areaId);

	p.error(function(err) {
		console.log('CareersController: areas ajax failed');
		console.error(err);
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
		console.error(err);
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
// Explainer Controller
///

app.controller('ExplainerController', function(
	$scope, args, $http, $routeParams, $modal, orderMgmt,
	$rootScope, sessionMgr, $q, layoutMgmt, delFeeMgmt,
	clientConfig
) {

	if(args.things) {
		$scope.things = args.things;
	}
	
	if(args.delFee) {
		$scope.delFee = args.delFee;
	}
	
	$scope.formattedDelFee = '$' + $scope.delFee;

	var rests = [];
	$scope.things.forEach(function(thing) {
		if(rests.indexOf(thing.restaurantName) < 0) {
			rests.push(thing.restaurantName);
		}
	});

	$scope.addRests = 0;
	if(rests.length > 1) {
		$scope.addRests = rests.length - 1;
	}

	$scope.addRestsFee = $scope.addRests * delFeeMgmt[3];

	$scope.restNames = '';
	var firstName = true;
	rests.forEach(function(rest) {
		if(firstName) {
			$scope.restNames = rest;
			firstName = false;
		} else {
			if(rests.indexOf(rest) < $scope.addRests) {
				$scope.restNames = $scope.restNames + ', ' + rest;
			} else {
				$scope.restNames = $scope.restNames + ' and ' + rest;
			}
		}
	})

	$scope.calcFee = $scope.delFee - $scope.addRestsFee;

	$scope.formattedAddRestsFee = '$' + ($scope.addRestsFee).toFixed(2);

	$scope.tierOneFee = '$' + (delFeeMgmt[0]).toFixed(2);
	$scope.tierTwoFee = '$' + (delFeeMgmt[1]).toFixed(2);
	$scope.tierThreeFee = '$' + (delFeeMgmt[2]).toFixed(2);

});


///
// Controller: Order
///

app.config(function(httpInterceptorProvider) {
	httpInterceptorProvider.register(/^\/order/);
});

app.controller('OrderDetailsController', function(
	$scope, $http, $routeParams, $modal, $timeout, $rootScope,
	orderMgmt, signupPrompter, sessionMgr, $q, $sce,
	querystring, configMgr, $window
) {

	function refreshData() {
		// assure that the page is still the same
		// must use pathname on https sites
		if(!location.pathname.match('order')) {
			return;
		}
		var sessionPromise = sessionMgr.getSession();

		sessionPromise.then(function(sessionData) {
			/*
			if(!sessionData.customerId) {
				$window.location.href = '/';
				return;
			}
			*/

			$scope.orderRestaurants = [];

			var r = $http.get('/orders/' + $routeParams.id);
		
			r.error(function(err) {
				console.log('OrderDetailsController: orders ajax failed');
				console.error(err);
			});
		
			r.then(function(res) {
				$scope.order = res.data;

				if(!$scope.order.customerId == sessionData.customerId) {
					$window.location.href = '/';
					return;
				}

				var statusMap = [
					'',
					'',
					'',
					'',
					'',
					'Payment Accepted',
					'Placed with Restaurant(s)',
					'Collected from Restaurant(s)',
					'En Route to Destination',
					'Delivered to Destination'
				];

				var currOrderStatus = parseInt($scope.order.orderStatus);

				$scope.orderStatusFormatted = statusMap[currOrderStatus];

				$scope.orderDate = new Date($scope.order.paymentAcceptedAt).toDateString().substr(4);

				$scope.paymentAcceptedAtFormatted = new Date($scope.order.paymentAcceptedAt).toTimeString().substr(0,5);
				$scope.placedAtFormatted = new Date($scope.order.orderPlacedAt).toTimeString().substr(0,5);
				$scope.collectedAtFormatted = new Date($scope.order.orderCollectedAt).toTimeString().substr(0,5);
				$scope.deliveredAtFormatted = new Date($scope.order.orderDeliveredAt).toTimeString().substr(0,5);

				$scope.orderStatus = parseInt($scope.order.orderStatus);
				$scope.paymentMethod = $scope.order.paymentMethods;
				$scope.subtotal = parseFloat($scope.order.subtotal).toFixed(2);
				$scope.tax = parseFloat($scope.order.tax).toFixed(2);
				$scope.deliveryFee = parseFloat($scope.order.deliveryFee).toFixed(2);
				$scope.gratuity = parseFloat($scope.order.gratuity).toFixed(2);
				$scope.discount = parseFloat($scope.order.discount).toFixed(2);
				$scope.total = '$'+parseFloat($scope.order.total).toFixed(2);
				if($scope.order && $scope.order.things) {
					$scope.order.things.forEach(function(thing) {
						$scope.getRestaurantName(thing.optionId).then(function(restaurantData) {
							var restaurant = _.find($scope.orderRestaurants, {name: restaurantData.name});
							if(! restaurant) {
								restaurant = {name: restaurantData.name, phone: restaurantData.phone, items: []};
								$scope.orderRestaurants.push(restaurant);
							}
							restaurant.items.push(
								_.pick(thing, ['quantity', 'name', 'option', 'specInst'])
							);
						});
					});
				}

				var r = $http.get('/customers/' + $scope.order.customerId);
				
				r.error(function(err) {
					console.log('OrderDetailsController: customer ajax failed');
					console.log(err);
				});
				
				r.then(function(res) {
					$scope.customer = res.data;
					$scope.fName = $scope.customer.fName;
					$scope.lName = $scope.customer.lName;
					$scope.phone = $scope.customer.phone;
					$scope.address = $scope.customer.addresses.primary.streetNumber+' '+$scope.customer.addresses.primary.streetName+' '+$scope.customer.addresses.primary.city;

					$scope.src = $sce.trustAsResourceUrl(
						'https://www.google.com/maps/embed/v1/place?' + querystring.stringify({
							key: configMgr.config.vendors.googleMaps.key,
							q: ([
								$scope.customer.addresses.primary.streetNumber,
								$scope.customer.addresses.primary.streetName,
								$scope.customer.addresses.primary.city,
								$scope.customer.addresses.primary.state,
								$scope.customer.addresses.primary.zip
							].join('+'))
						})
					);
				});
			});
		});

		$timeout(function() {
			refreshData();
		}, 6000);
	}
	refreshData();

	$scope.getRestaurantName = function(optionId) {
		return $q(function(resolve, reject) {
			var r = $http.get('/options/' + optionId);
				
			r.error(function(err) {
				console.log('OrderDetailsController: getRestaurantName-options ajax failed');
				console.log(err);
				reject(err);
			});
				
			r.then(function(res) {
				var s = $http.get('/items/' + res.data.itemId);
					
				s.error(function(err) {
					console.log('OrderDetailsController: getRestaurantName-items ajax failed');
					console.log(err);
					reject(err);
				});
					
				s.then(function(res) {
					var t = $http.get('/menus/' + res.data.menuId);
						
					t.error(function(err) {
						console.log('OrderDetailsController: getRestaurantName-menus ajax failed');
						console.log(err);
						reject(err);
					});
						
					t.then(function(res) {
						var u = $http.get('/restaurants/' + res.data.restaurantId);
							
						u.error(function(err) {
							console.log('OrderDetailsController: getRestaurantName-restaurants ajax failed');
							console.log(err);
							reject(err);
						});
							
						u.then(function(res) {
							resolve(res.data);
						});
					});
				});
			});
		});
	};
});


///
// Controllers: Restaurants
///


app.factory('restaurantsMgr', function(
	$http, $q, $rootScope
) {
	var deferred;

	var service = {
		getRestaurants: function() {
			if(deferred) {
				return deferred.promise;
			}

			deferred = $q.defer();

			var areaId = $rootScope.areaId;

			// Retrieve restaurants
			$http.get('/restaurants/byAreaId/' + areaId).then(function(res) {
				// if restaurants ajax succeeds...
				var allRestaurants = res.data;

				var promises = [];

				allRestaurants.map(function(restaurant) {
					var p = $http.get('/menus/byRestaurantId/' + restaurant.id);
					p.then(function(res) {
						// if menus ajax succeeds...
						restaurant.menus = res.data;
					});
					promises.push(p);
				});

				deferred.resolve($q.all(promises).then(function() {
					return allRestaurants;
				}));

			}).catch(function(err) {
				console.error('Error while retrieving restaurants:', err);
				deferred.reject(err);
			});

			return deferred.promise;
		},

		getRestaurantBySlug: function(slug) {
			return service.getRestaurants().then(function(restaurants) {
				return _.find(restaurants, function(restaurant) {
					return slug.match(restaurant.slug);
				});
			});
		},

		getMenuBySlug: function(slug) {
			return service.getRestaurants().then(function(restaurants) {
				// Build menu
				var menus = _.flatten(_.pluck(restaurants, 'menus'));
				return _.findWhere(menus, {slug: slug});
			});
		}
	};

	return service;
});


app.config(function(httpInterceptorProvider) {
	httpInterceptorProvider.register(/^\/restaurants/);
});

app.controller('RestaurantsController', function(
	$rootScope, $scope, $http, $routeParams, $modal, $location, $window, $q,
	orderMgmt, signupPrompter, deviceMgr, slugMgr, restaurantsMgr,
	seo
) {
	if($location.path().match(/^\/$/) && ! deviceMgr.isBigScreen()) {
		$window.location.href = '/app/restaurants/';
	}

	signupPrompter.prompt();

	$scope.buildRestMenus = function(slug) {
		restaurantsMgr.getRestaurants().then(function(allRestaurants) {
			$scope.restaurants = allRestaurants;
			$scope.restaurantId = allRestaurants[0].id;
		});
		restaurantsMgr.getRestaurantBySlug(slug).then(function(restaurant) {
			restaurant || (restaurant = {});

			// Manage search engine optimization for restaurants
			seo.reset();
			seo.setTitle(restaurant.name);
			seo.setDescription(
				'Delivery from ' + restaurant.name + ' in ' + $rootScope.areaName
			);

			// Build and set SEO keywords
			seo.appendKeywords([
				restaurant.name,
				'delivery from ' + restaurant.name,
			]);

			if(restaurant.cuisine) {
				seo.appendKeywords(restaurant.cuisine);

				var split = restaurant.cuisine.split(' ');
				if(split.length > 1) {
					seo.appendKeywords(split);
				}
			}

			seo.appendKeywords([
				$rootScope.areaName,
				$rootScope.areaName + ' restaurant delivery',
				$rootScope.areaName + ' food delivery',
				'restaurant',
				'restaurant delivery',
				'food',
				'food delivery',
			]);

			$scope.displayRestaurant = restaurant;
			$scope.showRestaurant(restaurant.id);
		});
	};

	var slugPromise;
	if($routeParams.id) {
		slugPromise = $q.when($routeParams.id);
	} else {
		slugPromise = slugMgr.randomSlug();
	}

	slugPromise.then(function(slug) {
		$scope.buildRestMenus(slug);
	});

	$scope.imageUrl = '/images/';

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
		$scope.restaurantId = id;
	};
});


///
// Menu Items
///

app.controller('MenuItemsController', function(
	$scope, $http, $routeParams, $q, orderMgmt, slugMgr,
	restaurantsMgr, seo
) {
	$scope.addItem = orderMgmt.add;

	// Retrieve and display menu data (including items)
	function showMenu(id) {
		$http.get('/menus/' + id).then(function(res) {
			// if menu ajax succeeds...
			$scope.menuId = res.data.id;
			$scope.menuName = res.data.name;
			getItems($scope.menuId);

		}).catch(function(err) {
			// if menu ajax fails...
			console.log('RestaurantsController: showMenu ajax failed');
			console.error(err);
		});

	}

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

	// Retrieve items by menu id (including options)
	function getItems(menuId) {
		$http.get('/items/activeByMenuId/' + menuId).then(function(res) {
			// if items ajax succeeds...
			var allItems = res.data;
			var keywords = [];

			allItems.map(function(item) {
				$http.get('/options/byItemId/' + item.id).then(function(res) {
					// if options ajax succeeds...
					item.options = res.data;

				}).catch(function(err) {
					// if options ajax fails...
					console.log('RestaurantsController: getItems-options ajax failed');
					console.error(err);
				});

				keywords.push(item.name);
			});

			// Add keywords for search engine optimization
			seo.appendKeywords(keywords);

			$scope.items = allItems;
		}).catch(function(err) {
			// if items ajax fails...
			console.log('RestaurantsController: getItems ajax failed');
			console.error(err);
		});

	};

	// Get slug
	var slugPromise;
	if($routeParams.id) {
		slugPromise = $q.when($routeParams.id);
	} else {
		slugPromise = slugMgr.randomSlug();
	}

	slugPromise.then(function(slug) {
		return restaurantsMgr.getMenuBySlug(slug);

	}).then(function(menu) {
		$scope.displayMenu = menu;
		showMenu(menu.id);
	});
});


///
// OrderController
///

app.controller('OrderController', function(
	navMgr, pod, $scope,
	$http, $routeParams, $modal, orderMgmt,
	$rootScope, sessionMgr, $q, layoutMgmt,
	clientConfig, delFeeMgmt, hoursMgr
) {
	// TODO
	// put this in a config? or what?
	// orderStatus map
	// < 1 = not started
	// 1   = started (ordering)
	// 2   = payment initiated
	// 3   = payment ajax call failed
	// 4   = payment declined
	// 5   = payment accepted
	// 6   = order ordered (at restaurant)
	// 7   = order picked up
	// 8   = order en route
	// 9   = order delivered
	
	$scope.clientConfig = clientConfig;

	$scope.removeItem = orderMgmt.remove;

	$scope.delFeeExp = orderMgmt.delFeeExp;

	$rootScope.$on('orderChanged', function(evt, args) {
		$scope.updateOrder();
	});

	///
	// Checkout Actions
	///

	$scope.checkout = function(order) {
		var isProhibited = true;

		var now = new Date().getHours();

		var delHoursPromise = hoursMgr.getDeliveryHours();
	
		delHoursPromise.then(function(delHours) {
			var now = new Date().getHours();
	
			delHours.forEach(function(hours) {
				if(hours.start > 11) {
					var todayStart = (parseInt(hours.start) - 12) + 'pm';
					var todayEnd = (parseInt(hours.end) - 12) + 'pm';
				} else {
					var todayStart = parseInt(hours.start) + 'am';
					var todayEnd = parseInt(hours.end) + 'am';
				}
			
				if(hours.end > 11) {
					var todayEnd = (parseInt(hours.end) - 12) + 'pm';
				} else {
					var todayEnd = parseInt(hours.end) + 'am';
				}
				
				var starting = (parseInt(hours.start) - 1);
				var ending = parseInt(hours.end);

				if(now >= starting && now < ending) {
					isProhibited = false;
				}

			});
			
			// clientConfig.showCheckout just overrides this logic in 
			// development environments
			if(clientConfig.showCheckout) {
				isProhibited = false;
			}

			if(isProhibited) {
				return orderMgmt.checkoutProhibited();
			}

			if(! (order && order.customerId)) {
				return layoutMgmt.logIn();
			}

			orderMgmt.checkout(order);
		
		});
	};

	$scope.updateOrder = function() {
		var sessionPromise = sessionMgr.getSession();
	
		sessionPromise.then(function(sessionData) {
			if(sessionData.order) {
				var order = sessionData.order;
				$scope.orderStatus = parseInt(order.orderStatus);
				$scope.order = order;
				$scope.things = order.things;
				$scope.updateTotals(order);
			}
		});
	};

	$scope.updateTotals = function(order) {
		var things;
		if(order.things) {
			things = order.things;
		} else {
			things = [];
		}

		var subtotal = 0;
		var tax = 0;
		// TODO this should be configged on the area level
		var taxRate = .05;
		var multiplier = 100;
		var deliveryFee = 0;
		var discount = 0;
		var gratuity = 0;
		var total = 0;

		if(things.length > 0) {
			things.forEach(function(thing) {
				var lineTotal;
	
				if(thing.quantity && thing.quantity > 1) {
					lineTotal = parseFloat(thing.price) * thing.quantity;
				} else {
					lineTotal = parseFloat(thing.price);
				}
				subtotal = (Math.round((subtotal + lineTotal) * 100)/100);
			});
		}

		tax = (Math.round((subtotal * taxRate) * 100) / 100);

		if(order.discount) {
			discount = parseFloat(order.discount);
		}

		if(order.gratuity) {
			gratuity = parseFloat(order.gratuity);
		}

		var sessionPromise = sessionMgr.getSession();

		sessionPromise.then(function(sessionData) {
			if(sessionData.order && sessionData.order.things) {
				var deliveryFeeTiers = delFeeMgmt;
				deliveryFee = deliveryFeeTiers[0];
		
				if(sessionData.customerId) {
					var deliveryFeePromise = $scope.calculateDeliveryFee(sessionData.customerId, things);
		
					deliveryFeePromise.then(function(feeData) {
						var addRestsFee = 0;

						if(feeData.addRests > 0) {
							addRestsFee = feeData.addRests * deliveryFeeTiers[3];
						}

						if(feeData.driveTime <= 450) {
							deliveryFee = deliveryFeeTiers[0];
						} else if(feeData.driveTime <= 720) {
							deliveryFee = deliveryFeeTiers[1];
						} else {
							deliveryFee = deliveryFeeTiers[2];
						}

						deliveryFee = deliveryFee + addRestsFee;
						
						total = (Math.round((subtotal + tax + deliveryFee - discount + gratuity) * 100)/100);
					
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
							console.log('OrderController: updateOrder ajax failed');
							console.error(err);
						});
					});
				} else {
					total = (Math.round((subtotal + tax + deliveryFee - discount + gratuity) * 100)/100);
				
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
						console.log('OrderController: updateOrder ajax failed');
						console.error(err);
					});
				}
			}
		});
	};

	$scope.calculateDeliveryFee = function(customerId, things) {
		return $q(function(resolve, reject) {
			var deliveryFeeTiers = delFeeMgmt;
	
			$http.get('/customers/' + customerId).then(function(res) {
				var customer = res.data;
	
				var promises = [];
				var rests = [];
				things.forEach(function(thing) {
					if(rests.indexOf(thing.restaurantId) < 0) {
						rests.push(thing.restaurantId);
					}
					promises.push(driveTimePromise = $scope.getDriveTime(thing, customer));
				});

				var addRests = 0;
				if(rests.length > 1) {
					addRests = rests.length - 1;
				}

				$q.all(promises).then(function(durations) {
					var mostDriveTime = 0;
					durations.forEach(function(duration) {
						if(duration > mostDriveTime) {
							mostDriveTime = duration;
						}
					});

					resolve({driveTime: mostDriveTime, addRests: addRests});
				});
			}).catch(function(err) {
				console.log('OrderController: calculateDeliveryFee-customer ajax failed');
				console.error(err);
				resolve(deliveryFeeTiers[0]);
			});
		});
	};

	$scope.getDriveTime = function(thing, customer) {
		return $q(function(resolve, reject) {
			$http.get('/restaurants/' + thing.restaurantId).then(function(res) {
				var addresses = res.data.addresses;
				var delivery = customer.addresses.primary;
				var addsLength = addresses.length;
				var scope = {};
				scope.durArray = []

				addresses.forEach(function(address) {
					$http.get('/distances/calc', {
						params: {
							origins: [
								'\''+address.streetNumber+' '+address.streetName+' '+address.city+' '+address.state+' '+address.zip+'\''
							].join('|'),
							destinations: [
								'\''+delivery.streetNumber+' '+delivery.streetName+' '+delivery.city+' '+delivery.state+' '+delivery.zip+'\''
							].join('+')
						}
					}).then(function(res) {
						var data = res.data;
						var nearest = 0;
						data.rows.forEach(function(row) {
							row.elements.forEach(function(element) {
								if(element.status == 'NOT_FOUND') {
									resolve(parseInt(5));
								} else {
									var duration = element.duration.value;
									scope.durArray.push(duration);
								}
							});
						});
						if(scope.durArray.length == addsLength) {
							scope.durArray.sort();
							resolve(scope.durArray[0]);
						}
					});
				});
				return;
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


///
// Account Management
///

app.factory('accountMgmt', function($modal, $rootScope, $http) {
	var service = {
		add: function(customerId) {
			$modal.open({
				templateUrl: '/templates/addPaymentMethod.html',
				backdrop: true,
				controller: 'AccountModalController',
				resolve: {
					args: function() {
						return {
							customerId: customerId
						}
					}
				}
			});
		},
		addToCheckout: function(customerId) {
			$modal.open({
				templateUrl: '/templates/addPaymentMethodToCheckout.html',
				backdrop: true,
				controller: 'AccountModalController',
				resolve: {
					args: function() {
						return {
							customerId: customerId
						}
					}
				}
			});
		},
		remove: function(pmId) {
			$modal.open({
				templateUrl: '/templates/removePaymentMethod.html',
				backdrop: true,
				controller: 'AccountModalController',
				resolve: {
					args: function() {
						return {
							pmId: pmId
						}
					}
				}
			});
		},
	};
	return service;
});


app.controller('AccountModalController', function(
	$window, $rootScope, $scope, $modalInstance, args, messenger,
	payMethodMgmt
) {

	if(args.pmId) {
		var pmId = args.pmId;
	}

	$scope.payMethod = {};

	$scope.addPaymentMethod = function() {
		var paymentData = {
			cardNumber: $scope.payMethod.cardNumber.toString(),
			expirationDate: $scope.payMethod.year + '-' + $scope.payMethod.month,
			cvv2: $scope.payMethod.cvv2
		};

		payMethodMgmt.addPM(paymentData).then(function(customer){
			messenger.show('The payment method has been added.', 'Success!');
			$modalInstance.dismiss('done');

			$rootScope.$broadcast('customerChanged', customer);
		}).catch(function(err) {
			$modalInstance.dismiss('cancel');
		});
	};

	$scope.removePaymentMethod = function() {
		// TODO: mark pmId as inactive
		console.log('$scope.removePaymentMethod() called with:');
		console.log($scope);
		console.log('pmId: '+pmId);
		$modalInstance.dismiss('done');
	};

});


app.controller('AccountController', function(
	$scope, $http, messenger, $rootScope, sessionMgr,
	$window, accountMgmt, layoutMgmt
) {

	$scope.addPM = accountMgmt.add;
	$scope.removePM = accountMgmt.remove;

	$scope.logOut = layoutMgmt.logOut;

	var sessionPromise = sessionMgr.getSession();

	sessionPromise.then(function(sessionData) {
		if(!sessionData.customerId) {
			$window.location.href = '/';
			return;
		}

		var customerId = sessionData.customerId;
		var p = $http.get('/customers/' + customerId);
	
		p.error(function(err) {
			console.log('AccountController: customers ajax failed');
			console.error(err);
		});
	
		p.then(function(res) {
			$scope.customer = res.data;
		});
	
		var r = $http.get('/orders/byCustomerId/' + customerId);
	
		r.error(function(err) {
			console.log('AccountController: orders ajax failed');
			console.error(err);
		});
	
		r.then(function(res) {
			var completedHistory = [];
			res.data.forEach(function(order) {
				if(order.orderStatus > 4) {
					order.updatedAt = order.updatedAt.substr(0,10);
					order.total = parseFloat(order.total).toFixed(2);
					completedHistory.push(order);
				}
			});
	
			$scope.orders = completedHistory;
		});
	});

	$rootScope.$on('customerChanged', function(evt, customer) {
		$scope.customer = customer;
	});
});

app.controller('AccountAddController', function(
	navMgr, pod, customerSchema,
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

			navMgr.protect(false);
			$window.location.href = '/app/account/' + data.id;
		});
	};

	$scope.cancel = function cancel() {
		navMgr.cancel('/app/');
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
		navMgr.cancel('/app/account/' +$routeParams.id);
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

