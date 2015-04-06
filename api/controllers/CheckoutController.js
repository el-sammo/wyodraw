/**
 * CheckoutController
 *
 * @description :: Server-side logic for managing Checkouts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Authorize = require('auth-net-types');
var _AuthorizeCIM = require('auth-net-cim');
var AuthorizeCIM = new _AuthorizeCIM(sails.config.authorizeNet);

module.exports = {
  processPayment: function(req, res) {
    var isAjax = req.headers.accept.match(/application\/json/);

		if(req.body && req.body.customer && req.body.paymentMethodId && req.body.amount) {
			return captureTransaction(req, res);
		}
  },

};

function captureTransaction(req, res, self) {
	var customer = req.body.customer;
	var paymentMethodId = req.body.paymentMethodId;
	var amount = req.body.amount;

	var customerProfileId = customer.aNetProfileId;

	var now = new Date();
	var milli = now.getTime();
	var secs = milli.toString();
	var orderId = secs.substr( (secs.length - 11), 8 );

	var transaction = {
	  amount: amount,
	  tax: {},
	  shipping: {},
	  customerProfileId: customerProfileId,
	  customerPaymentProfileId: paymentMethodId,
	  order: {
	    invoiceNumber: orderId
	  }
	};
	 
	AuthorizeCIM.createCustomerProfileTransaction(
		// transaction types:
		// AuthCapture, AuthOnly, CaptureOnly, PriorAuthCapture
		'AuthCapture',
		 transaction,
	function(err, response) {
		if(err) {
			console.log('err:');
			console.log(err);
			return errorHandler(err)();
		}
		var dirResPcs = response.directResponse.split(',');
		if(dirResPcs[3] == 'This transaction has been approved.') {
			console.log('payment successful');
    	return res.send(JSON.stringify({success: true, message: dirResPcs[3], total: amount}));
		} else {
			console.log(dirResPcs[3]);
    	return res.send(JSON.stringify({success: false, message: dirResPcs[3]}));
		}
	});

  ///
  // Convenience subfunctions
  ///

  function respond(err) {
    var isAjax = req.headers.accept.match(/application\/json/);
    var errCode = 400;

    if(err) {
      if(isAjax) {
        return res.send(JSON.stringify({error: err}), errCode);
      }
    }
  };

  function errorHandler(errMsg) {
    return function(err) {
      if(err) console.error(err);
      respond(errMsg);
    };
  };
}


