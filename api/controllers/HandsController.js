/**
 * HandsController
 *
 * @description :: Server-side logic for managing hands
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require('lodash');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');

var serverError = 'An error occurred. Please try again later.';

var httpAdapter = 'http';
var extra = {};

module.exports = {
	setConfig: function(req, res) {
		var keyValues = req.body;
		if(! _.isObject(keyValues) || _.size(keyValues) < 1) {
			return res.json({error: 'No key-value pairs were given'});
		}

		var invalidHandId = new Error('Invalid hand ID');

		var handId = req.params.id;
		var errorCode;

		Promise.resolve().then(function() {
			if(! handId) {
				errorCode = 404;
				return Promise.reject(invalidHandId);
			}

			return Hands.findOne(handId);

		}).then(function(hand) {
			if(! hand) {
				errorCode = 404;
				return Promise.reject(invalidHandId);
			}

			var config = _.extend({}, hand.config || {}, keyValues);
			return Hands.update(handId, {config: config});

		}).then(function() {
			res.json({success: true});

		}).catch(function(err) {
			res.json({error: err}, 500);
		});
	}

};

function getAddressCoords(req, res, self) {
	var addressString = req.params.id;

	return geocoder.geocode(addressString).then(function(data) {
		var lat = data[0].latitude;
		var long = data[0].longitude;
		var gPID = data[0].extra.googlePlaceId;

		return res.send(JSON.stringify({success: true, lat: lat, long: long, gPID: gPID}));
	}).catch(function(err) {
		console.log('geocode failure');
		console.log(err);
		return res.send(JSON.stringify({success: false, lat: '', long: '', gPID: ''}));
	});
}
