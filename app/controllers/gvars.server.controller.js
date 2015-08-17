'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Gvar = mongoose.model('Gvar'),
	_ = require('lodash');

/**
 * Create a Gvar
 */
exports.create = function(req, res) {
	var gvar = new Gvar(req.body);
	gvar.user = req.user;

	gvar.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(gvar);
		}
	});
};

/**
 * Show the current Gvar
 */
exports.read = function(req, res) {
	res.jsonp(req.gvar);
};

/**
 * Update a Gvar
 */
exports.update = function(req, res) {
	var gvar = req.gvar ;

	gvar = _.extend(gvar , req.body);

	gvar.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(gvar);
		}
	});
};

/**
 * Delete an Gvar
 */
exports.delete = function(req, res) {
	var gvar = req.gvar ;

	gvar.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(gvar);
		}
	});
};

/**
 * List of Gvars
 */
exports.list = function(req, res) { 
	Gvar.find().sort('-created').populate('user', 'displayName').exec(function(err, gvars) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(gvars);
		}
	});
};

/**
 * Gvar middleware
 */
exports.gvarByID = function(req, res, next, id) { 
	Gvar.findById(id).populate('user', 'displayName').exec(function(err, gvar) {
		if (err) return next(err);
		if (! gvar) return next(new Error('Failed to load Gvar ' + id));
		req.gvar = gvar ;
		next();
	});
};

/**
 * Gvar authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.gvar.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
