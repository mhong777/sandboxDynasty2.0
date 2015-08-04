'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	//errorHandler = require('./errors.server.controller'),
	Bid = mongoose.model('Bid'),
	_ = require('lodash');

/**
 * Create a Bid
 */
exports.create = function(req, res) {
	var bid = new Bid(req.body);
	bid.user = req.user;

	bid.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bid);
		}
	});
};

/**
 * Show the current Bid
 */
exports.read = function(req, res) {
	res.jsonp(req.bid);
};

/**
 * Update a Bid
 */
exports.update = function(req, res) {
	var bid = req.bid ;

	bid = _.extend(bid , req.body);

	bid.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bid);
		}
	});
};

/**
 * Delete an Bid
 */
exports.delete = function(req, res) {
	var bid = req.bid ;

	bid.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bid);
		}
	});
};

/**
 * List of Bids
 */
exports.list = function(req, res) { 
	Bid.find().sort('-created').populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bids);
		}
	});
};

/**
 * Bid middleware
 */
exports.bidByID = function(req, res, next, id) { 
	Bid.findById(id).populate('user', 'displayName').exec(function(err, bid) {
		if (err) return next(err);
		if (! bid) return next(new Error('Failed to load Bid ' + id));
		req.bid = bid ;
		next();
	});
};

/**
 * Bid authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.bid.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
