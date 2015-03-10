/**
 * CustomersController
 *
 * @description :: Server-side logic for managing customers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var bcrypt = require('bcrypt');

var loginError = 'Invalid username, email, or password.';
var serverError = 'An error occurred. Please try again later.';
var nextUrl = '/#/';
var loginUrl = '/login';
var layout = 'customers/loginLayout';
var view = 'login';

module.exports = {
  login: function(req, res) {
    var isAjax = req.headers.accept.match(/application\/json/);

    if(req.session.isAuthenticated) {
      if(isAjax) {
        return res.send(JSON.stringify({
          success: true,
					customerId: req.session.customerId
        }));
      }
      return res.redirect(nextUrl);
		}

    if(! req.url.replace(/\?.*/, '').match(loginUrl)) {
      return res.redirect(loginUrl);
    }

    if(req.body && req.body.username && req.body.password) {
      return processLogin(req, res);
    }

    if(isAjax) {
      return res.send(JSON.stringify({
        error: loginError
      }), 401);
    }

    res.view({layout: layout}, view);
  },

  logout: function(req, res) {
    req.session.isAuthenticated = false;
    req.session.customerId = null;
    return res.send(JSON.stringify({success: true}));
  },

	session: function(req, res) {
		var sessionData = {};
		sessionData.orders = {};

		if(req && req.sessionID) {
			sessionData.sid = req.sessionID;
		} else {
			console.log('*****     we DON\'T have a req.sessionID for some reason     *****');
			console.log('     ');
			console.log('     ');
			console.log('     ');
		 	console.log(req);
			console.log('     ');
			console.log('     ');
			console.log('     ');
		}

		if(req.session && req.session.customerId) {
			sessionData.customerId = req.session.customerId;
		}

		var promise;
		if(sessionData.customerId) {
			promise = Orders.findByCustomerId(sessionData.customerId);
		} else {
			promise = Orders.findBySessionId(sessionData.sid);
		}

		promise.then(function(orders) {
			if(orders.length > 0) {
				sessionData.orders = orders;
			}
			res.send(JSON.stringify(sessionData));
		});

		res.send(JSON.stringify(sessionData));
  },

  datatables: function(req, res) {
    var options = req.query;

    Customers.datatables(options).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  }
	
};

function processLogin(req, res, self) {
  Customers.findOne({or: [
    {username: req.body.username},
    {email: req.body.username}
  ]}).then(function(customer) {
    if(! customer) return errorHandler(loginError)();

    var onCompare = bcrypt.compareAsync(
      req.body.password, customer.password
    );
    onCompare.then(function(match) {
      if(! match) return errorHandler(loginError)();

      req.session.isAuthenticated = true;
      req.session.customerId = customer.id;

      respond();

    }).catch(errorHandler(serverError));

  }).catch(errorHandler(serverError));

  ///
  // Convenience subfunctions
  ///

  function respond(err) {
    var isAjax = req.headers.accept.match(/application\/json/);
    var errCode = 400;

    if(err) {
      if(isAjax) {
        if(err == loginError) errCode = 401;
        return res.send(JSON.stringify({error: err}), errCode);
      }

      return res.view({
        layout: layout,
        error: err
      }, view);
    }

    if(isAjax) {
      return res.send(JSON.stringify({success: true, customerId: req.session.customerId}));
    }

    return res.redirect(nextUrl);
  };

  function errorHandler(errMsg) {
    return function(err) {
      if(err) console.error(err);
      respond(errMsg);
    };
  };
}

