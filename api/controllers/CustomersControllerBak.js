
	session: function(req, res) {
		var sessionData = {};
		sessionData.order = {};

		// Get order for session
		var p = Orders.find({sessionId: req.sessionID, orphaned: false});
		p.sort({updatedAt: 'desc'}).limit(1).then(function(results) {
			var sessionOrder = results[0];

			var customerOrder = {};
			if(! (req.session && req.session.customerId)) {
				return [sessionOrder, customerOrder];
			}

			// Get order for customer
			return Orders.find({
				'customerId': sessionData.customerId, 'orphaned': false
			}).sort({updatedAt: 'desc'}).then(function(results) {
				customerOrder = results[0];
				return [sessionOrder, customerOrder];
			});
		}).spread(function(sessionOrder, customerOrder) {
			// Pick which order is the most recent and attach to sessionData
			sessionOrder.updatedAt || (sessionOrder.updatedAt = 0);
			customerOrder.updatedAt || (customerOrder.updatedAt = 0);
			if(customerOrder.updatedAt >= sessionOrder.updatedAt) {
				sessionData.order = customerOrder;
			} else {
				sessionData.order = sessionOrder;
			}

			// Also, make sure that if the session order doesn't have a customer id,
			// and a customer id is present, we set the customer id on the session
			// order
			if(! sessionOrder.customerId && req.session && req.session.customerId) {
				sessionOrder.customerId = req.session.customerId;
				Orders.update(sessionOrder.id, {customerId: sessionOrder.customerId});
			}

			// Build rest of sessionData
			if(req && req.sessionID) {
				sessionData.sid = req.sessionID;
			}

			if(req.session && req.session.customerId) {
				sessionData.customerId = req.session.customerId;
			}

			// Send session data
			res.json(sessionData);
		}).catch(function(err) {
			res.json({error: 'Server error'}, 500);
			console.error(err);
		});
  },

