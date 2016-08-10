'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	//errorHandler = require('./errors.server.controller'),
	Bidlog = mongoose.model('Bidlog'),
	_ = require('lodash');

/**
 * Create a Bidlog
 */
exports.create = function(req, res) {
	var bidlog = new Bidlog(req.body);
	bidlog.user = req.user;

	bidlog.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bidlog);
		}
	});
};

/**
 * Show the current Bidlog
 */
exports.read = function(req, res) {
	res.jsonp(req.bidlog);
};

/**
 * Update a Bidlog
 */
exports.update = function(req, res) {
	var bidlog = req.bidlog ;

	bidlog = _.extend(bidlog , req.body);

	bidlog.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bidlog);
		}
	});
};

/**
 * Delete an Bidlog
 */
exports.delete = function(req, res) {
	var bidlog = req.bidlog ;

	bidlog.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bidlog);
		}
	});
};

/**
 * List of Bidlogs
 */
exports.list = function(req, res) { 
	Bidlog.find().sort('-created').populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bidlogs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bidlogs);
		}
	});
};

/**
 * Bidlog middleware
 */
exports.bidlogByID = function(req, res, next, id) { 
	Bidlog.findById(id).populate('user', 'displayName').exec(function(err, bidlog) {
		if (err) return next(err);
		if (! bidlog) return next(new Error('Failed to load Bidlog ' + id));
		req.bidlog = bidlog ;
		next();
	});
};

/**
 * Bidlog authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.bidlog.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
