'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var sales = require('../../app/controllers/sales.server.controller');

	// Sales Routes
	app.route('/sales')
		.get(sales.list)
		.post(users.requiresLogin, sales.create);

	app.route('/sales/:saleId')
		.get(sales.read)
		.put(users.requiresLogin, sales.hasAuthorization, sales.update)
		.delete(users.requiresLogin, sales.hasAuthorization, sales.delete);

	// Finish by binding the Sale middleware
	app.param('saleId', sales.saleByID);
};
