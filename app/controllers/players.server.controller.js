'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Player = mongoose.model('Player'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Player already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a Player
 */
exports.create = function(req, res) {
	var player = new Player(req.body);
	player.user = req.user;

	player.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(player);
		}
	});
};

/**
 * Show the current Player
 */
exports.read = function(req, res) {
	res.jsonp(req.player);
};

/**
 * Update a Player
 */
exports.update = function(req, res) {
	//var player = req.player ;
	//console.log(player);
    //
	//player = _.extend(player , req.body);

	var rPlayer=req.body.player;
	Player.findById(rPlayer._id).exec(function(err, player) {
		if (err) {
			console.log(err);
		} else {
			player.name=rPlayer.name;
			player.user=rPlayer.user;
			player.position=rPlayer.position;
			player.price=rPlayer.price;
			player.available=rPlayer.available;
			player.yearsOwned=rPlayer.yearsOwned;
			player.owner=rPlayer.owner;
			player.rookie=rPlayer.rookie;
			player.team=rPlayer.team;
			player.absRank=rPlayer.absRank;
			player.posRank=rPlayer.posRank;

			player.save();
			console.log(player);
			res.jsonp(player);
		}
	});
};

/**
 * Delete an Player
 */
exports.delete = function(req, res) {
	var player = req.player ;

	player.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(player);
		}
	});
};

/**
 * List of Players
 */
exports.list = function(req, res) { Player.find().sort('-created').populate('owner', 'name').exec(function(err, players) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(players);
		}
	});
};

/**
 * Player middleware
 */
exports.playerByID = function(req, res, next, id) {
	Player.findById(id).exec(function(err, player) {
		if (err) return next(err);
		if (! player) return next(new Error('Failed to load Player ' + id));
		req.player = player ;
		next();
	});
};

/**
 * Player authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.player.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};