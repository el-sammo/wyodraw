/**
 * TournamentsController
 *
 * @description :: Server-side logic for managing tournaments
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

		var invalidTournamentId = new Error('Invalid tournament ID');

		var tournamentId = req.params.id;
		var errorCode;

		Promise.resolve().then(function() {
			if(! tournamentId) {
				errorCode = 404;
				return Promise.reject(invalidTournamentId);
			}

			return Tournaments.findOne(tournamentId);

		}).then(function(tournament) {
			if(! tournament) {
				errorCode = 404;
				return Promise.reject(invalidTournamentId);
			}

			var config = _.extend({}, tournament.config || {}, keyValues);
			return Tournaments.update(tournamentId, {config: config});

		}).then(function() {
			res.json({success: true});

		}).catch(function(err) {
			res.json({error: err}, 500);
		});
	},

	byName: function(req, res) {
		Tournaments.find({name: req.params.id}).sort({
			name: 'asc', startsAt: 'asc'
		}).limit(50).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	},
	
  datatables: function(req, res) {
    var options = req.query;

    Tournaments.datatables(options).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  }
	
};
