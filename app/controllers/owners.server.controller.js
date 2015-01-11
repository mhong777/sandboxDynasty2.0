'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Owner = mongoose.model('Owner'),
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
				message = 'Owner already exists';
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
 * Create a Owner
 */
exports.create = function(req, res) {
	var owner = new Owner(req.body);
	owner.user = req.user;

	owner.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(owner);
		}
	});
};

/**
 * Show the current Owner
 */
exports.read = function(req, res) {
	res.jsonp(req.owner);
};

/**
 * Update a Owner
 */
exports.update = function(req, res) {
	var owner = req.owner ;

	owner = _.extend(owner , req.body);

	owner.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(owner);
		}
	});
};

/**
 * Delete an Owner
 */
exports.delete = function(req, res) {
	var owner = req.owner ;

	owner.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(owner);
		}
	});
};

/**
 * List of Owners
 */
exports.list = function(req, res) { Owner.find().sort('-created').populate('user', 'displayName').exec(function(err, owners) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(owners);
		}
	});
};

/**
 * Owner middleware
 */
exports.ownerByID = function(req, res, next, id) { Owner.findById(id).populate('user', 'displayName').exec(function(err, owner) {
		if (err) return next(err);
		if (! owner) return next(new Error('Failed to load Owner ' + id));
		req.owner = owner ;
		next();
	});
};

/**
 * Owner authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.owner.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};