/**
 * MailController
 *
 * @description :: Server-side logic for managing Mails
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var mailer = require('nodemailer');
var Promise = require('bluebird');

module.exports = {
	sendToCustomer: function(req, res) {
		var customerId = req.params.id;

		var p = $http.get('/customers/' + customerId);

		p.error(function(err) {
			console.log('MailController: customer ajax failed');
			console.log(err);
		});

		// Lookup email from db using customerId
		p.then(function(userData) {
			return sendMail(email, subject, template, data);
		}).then(function() {
			res.json({success: true});
		}).catch(function(err) {
			res.json({error: 'Server error'}, 500);
			console.error(err);
		});
	},

	sendToApplicant: function(req, res) {
		var applicantId = req.params.id;
		
		var p = $http.get('/applicants/' + applicantId);

		p.error(function(err) {
			console.log('MailController: applicant ajax failed');
			console.log(err);
		});

		// Lookup email from db using applicantId
		p.then(function(userData) {
			console.log('userData:');
			console.log(userData);
			//return sendMail(email, subject, template, data);
		}).then(function() {
			//res.json({success: true});
		}).catch(function(err) {
			//res.json({error: 'Server error'}, 500);
			//console.error(err);
		});
	}
};

function sendMail(email, subject, template, data) {
	var p = Promise.defer();

	var transporter = '';
	var mailOptions = '';

	// Use mailer
	transporter.sendMail(mailOptions, function(err, info) {
		if(err) {
			return p.reject(err);
		}

		p.resolve(info);
	});

	return p.promise;
}

