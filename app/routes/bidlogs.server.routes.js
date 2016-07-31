'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var bidlogs = require('../../app/controllers/bidlogs.server.controller');

	// Bidlogs Routes
	app.route('/bidlogs')
		.get(bidlogs.list)
		.post(users.requiresLogin, bidlogs.create);

	app.route('/bidlogs/:bidlogId')
		.get(bidlogs.read)
		.put(users.requiresLogin, bidlogs.hasAuthorization, bidlogs.update)
		.delete(users.requiresLogin, bidlogs.hasAuthorization, bidlogs.delete);

	// Finish by binding the Bidlog middleware
	app.param('bidlogId', bidlogs.bidlogByID);
};