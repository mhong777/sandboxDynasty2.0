'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var gvars = require('../../app/controllers/gvars.server.controller');

	// Gvars Routes
	app.route('/gvars')
		.get(gvars.list)
		.post(users.requiresLogin, gvars.create);

	app.route('/gvars/:gvarId')
		.get(gvars.read)
		.put(users.requiresLogin, gvars.hasAuthorization, gvars.update)
		.delete(users.requiresLogin, gvars.hasAuthorization, gvars.delete);

	// Finish by binding the Gvar middleware
	app.param('gvarId', gvars.gvarByID);
};
