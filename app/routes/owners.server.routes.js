'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var owners = require('../../app/controllers/owners');

	// Owners Routes
	app.route('/owners')
		.get(owners.list)
		.post(users.requiresLogin, owners.create);

	app.route('/owners/:ownerId')
		.get(owners.read)
		.put(users.requiresLogin, owners.update)
		.delete(users.requiresLogin, owners.delete);

	app.route('/batchAddPlayer')
		.put(owners.batchAddPlayer);

	app.route('/changeKeeper')
		.put(owners.changeKeeper);

	app.route('/changeBidee')
		.put(owners.changeBidee);

	app.route('/ownerChange')
		.put(owners.ownerChange);

	app.route('/reviewRoster')
		.get(owners.reviewRoster);

	app.route('/editRoster/:ownerId')
		.get(owners.editRoster);

	app.route('/ownersAndPlayers')
		.get(owners.ownersAndPlayers);

	//app.route('/changeKeeper')
	//	.put(owners.changeKeeper);

	// Finish by binding the Owner middleware
	app.param('ownerId', owners.ownerByID);
};