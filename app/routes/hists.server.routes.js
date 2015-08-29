'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var hists = require('../../app/controllers/hists.server.controller');

	// Hists Routes
	app.route('/hists')
		.get(hists.list)
		.post(users.requiresLogin, hists.create);

	app.route('/hists/:histId')
		.get(hists.read)
		.put(users.requiresLogin, hists.hasAuthorization, hists.update)
		.delete(users.requiresLogin, hists.hasAuthorization, hists.delete);

	// Finish by binding the Hist middleware
	app.param('histId', hists.histByID);
};
