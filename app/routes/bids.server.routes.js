'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var bids = require('../../app/controllers/bids.server.controller');

	// Bids Routes
	app.route('/bids')
		.get(bids.list)
		.post(users.requiresLogin, bids.create);

	app.route('/bids/:bidId')
		.get(bids.read)
		.put(users.requiresLogin, bids.hasAuthorization, bids.update)
		.delete(users.requiresLogin, bids.hasAuthorization, bids.delete);

	// Finish by binding the Bid middleware
	app.param('bidId', bids.bidByID);
};
