/**
 * FixCustomersController
 *
 * @description :: Server-side logic for fixing customers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require('lodash');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');

var loginError = 'Invalid username, email, or password.';
var serverError = 'An error occurred. Please try again later.';
var nextUrl = '/#/';
var loginUrl = '/login';
var layout = 'customers/loginLayout';
var view = 'login';

var Authorize = require('auth-net-types');
var _AuthorizeCIM = require('auth-net-cim');
var AuthorizeCIM = new _AuthorizeCIM(sails.config.authorizeNet);

var geocoderProvider = 'google';
var httpAdapter = 'http';
var extra = {};
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

module.exports = {
  addGeo: function(req, res) {
		console.log('addGeo() called');
    var isAjax = req.headers.accept.match(/application\/json/);

		Customers.find({geo: {$exists: false}}).then(function(res) {
			res.forEach(function(customer) {
				addGeoLocation(customer);
			});
		});
  }

};

function addGeoLocation(customer) {
	var address = customer.addresses.primary;
	var addressString = address.streetNumber+' '+address.streetName+' '+address.city+' '+address.state+' '+address.zip;

	var geo = {}
	geocoder.geocode(addressString).then(function(data) {
		geo.lat = data[0].latitude;
		geo.longitude = data[0].longitude;
		geo.googlePlaceId = data[0].extra.googlePlaceId;

		customer.geo = geo;

		Customers.update(customer.id, customer).exec(function(err, customers) {
			console.log('updated:', customer.id);
			if(err) {
				console.error(err);
			}
		});
	});
}
