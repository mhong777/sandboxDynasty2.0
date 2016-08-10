'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Hist = mongoose.model('Hist'),
	_ = require('lodash');

/**
 * Create a Hist
 */
exports.create = function(req, res) {
	var hist = new Hist(req.body);
	hist.user = req.user;

	hist.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(hist);
		}
	});
};

/**
 * Show the current Hist
 */
exports.read = function(req, res) {
	res.jsonp(req.hist);
};

/**
 * Update a Hist
 */
exports.update = function(req, res) {
	var hist = req.hist ;

	hist = _.extend(hist , req.body);

	hist.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(hist);
		}
	});
};

/**
 * Delete an Hist
 */
exports.delete = function(req, res) {
	var hist = req.hist ;

	hist.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(hist);
		}
	});
};

/**
 * List of Hists
 */
exports.list = function(req, res) { 
	Hist.find().sort('-created').populate('user', 'displayName').populate('playerdat').populate('ownerdat').exec(function(err, hists) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(hists);
		}
	});
};

/**
 * Hist middleware
 */
exports.histByID = function(req, res, next, id) { 
	Hist.findById(id).populate('user', 'displayName').exec(function(err, hist) {
		if (err) return next(err);
		if (! hist) return next(new Error('Failed to load Hist ' + id));
		req.hist = hist ;
		next();
	});
};

/**
 * Hist authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.hist.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
