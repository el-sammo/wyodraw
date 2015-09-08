/**
 * TournamentPlayersController
 *
 * @description :: Server-side logic for managing tournamentPlayers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require('lodash');
var Promise = require('bluebird');

var serverError = 'An error occurred. Please try again later.';

module.exports = {
	setConfig: function(req, res) {
		var keyValues = req.body;
		if(! _.isObject(keyValues) || _.size(keyValues) < 1) {
			return res.json({error: 'No key-value pairs were given'});
		}

		var invalidTournamentPlayerId = new Error('Invalid tournamentPlayer ID');

		var tournamentPlayerId = req.params.id;
		var errorCode;

		Promise.resolve().then(function() {
			if(! tournamentPlayerId) {
				errorCode = 404;
				return Promise.reject(invalidTournamentPlayerId);
			}

			return TournamentPlayers.findOne(tournamentPlayerId);

		}).then(function(tournamentPlayer) {
			if(! tournamentPlayer) {
				errorCode = 404;
				return Promise.reject(invalidTournamentPlayerId);
			}

			var config = _.extend({}, tournamentPlayer.config || {}, keyValues);
			return TournamentPlayers.update(tournamentPlayerId, {config: config});

		}).then(function() {
			res.json({success: true});

		}).catch(function(err) {
			res.json({error: err}, 500);
		});
	},

	byTournamentId: function(req, res) {
		TournamentPlayers.find({tournamentId: req.params.id}).sort({
			username: 'asc'
		}).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	},
	
  datatables: function(req, res) {
    var options = req.query;

    TournamentPlayers.datatables(options).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  }
	
};
