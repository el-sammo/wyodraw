/**
 * FixDrawingsController
 *
 * @description :: Server-side logic for fixing drawings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require('lodash');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');

var loginError = 'Invalid username, email, or password.';
var serverError = 'An error occurred. Please try again later.';
var nextUrl = '/#/';
var loginUrl = '/login';
var layout = 'drawings/loginLayout';
var view = 'login';

var Authorize = require('auth-net-types');
var _AuthorizeCIM = require('auth-net-cim');
var AuthorizeCIM = new _AuthorizeCIM(sails.config.authorizeNet);

var geocoderProvider = 'google';
var httpAdapter = 'http';
var extra = {};
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

module.exports = {
  addDateStamp: function(req, res) {
    var isAjax = req.headers.accept.match(/application\/json/);

		Drawings.find({dateStamp: {$exists: false}}).then(function(res) {
			res.forEach(function(drawing) {
				addDateStamp(drawing);
			});
		});
  },

  addGeo: function(req, res) {
		console.log('addGeo() called');
    var isAjax = req.headers.accept.match(/application\/json/);

		Drawings.find({geo: {$exists: false}}).then(function(res) {
			res.forEach(function(drawing) {
				addGeoLocation(drawing);
			});
		});
  },

  addRestGeo: function(req, res) {
		console.log('addRestGeo() called');
    var isAjax = req.headers.accept.match(/application\/json/);

		Restaurants.find({geoAdded: false}).then(function(res) {
			res.forEach(function(restaurant) {
				addRestGeoLocation(restaurant);
			});
		});
  }

};

function addDateStamp(drawing) {
	var dateStamp = drawing.drawDate.substr(6) + drawing.drawDate.substr(0, 2) + drawing.drawDate.substr(3, 2);

	drawing.dateStamp = dateStamp;


	Drawings.update(drawing.id, drawing).exec(function(err, drawings) {
		console.log('updated:', drawing.id);
		if(err) {
			console.error(err);
		}
	});
}

function addRestGeoLocation(restaurant) {
	var newAddresses = [];
	restaurant.addresses.forEach(function(address) {
		var addressString = address.streetNumber+' '+address.streetName+' '+address.city+' '+address.state+' '+address.zip;

		geocoder.geocode(addressString).then(function(data) {
			var thisAddress = {};
			var geo = {}

			geo.latitude = data[0].latitude;
			geo.longitude = data[0].longitude;
			geo.googlePlaceId = data[0].extra.googlePlaceId;

			thisAddress.streetNumber = address.streetNumber;
			thisAddress.streetName = address.streetName;
			thisAddress.city = address.city;
			thisAddress.state = address.state;
			thisAddress.zip = address.zip;
			thisAddress.geo = geo;
	
			newAddresses.push(thisAddress);
			if(newAddresses.length == restaurant.addresses.length) {
				restaurant.addresses = newAddresses;
				restaurant.geoAdded = true;
				
				Restaurants.update(restaurant.id, restaurant).exec(function(err, restaurants) {
					console.log('updated:', restaurant.name);
					if(err) {
						console.error(err);
					}
				});
			}
		});
	});
}
