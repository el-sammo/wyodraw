/**
 * TablesController
 *
 * @description :: Server-side logic for managing tables
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

		var invalidTableId = new Error('Invalid table ID');

		var tableId = req.params.id;
		var errorCode;

		Promise.resolve().then(function() {
			if(! tableId) {
				errorCode = 404;
				return Promise.reject(invalidTableId);
			}

			return Tables.findOne(tableId);

		}).then(function(table) {
			if(! table) {
				errorCode = 404;
				return Promise.reject(invalidTableId);
			}

			var config = _.extend({}, table.config || {}, keyValues);
			return Tables.update(tableId, {config: config});

		}).then(function() {
			res.json({success: true});

		}).catch(function(err) {
			res.json({error: err}, 500);
		});
	},

	byTournamentId: function(req, res) {
		Tables.find({tournamentId: req.params.id}).sort({
			name: 'asc', startsAt: 'asc'
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

    Tables.datatables(options).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  }
	
};
