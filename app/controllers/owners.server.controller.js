'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Owner = mongoose.model('Owner'),
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
 * Update a Owner
 */
exports.batchAddPlayer = function(req, res) {
	var stuff=req.body;
	Owner.findById(stuff.ownerId).exec(function(err, owner) {
		if (err) {
			console.log(err);
		} else {
			owner.previousRoster.push(stuff.playerId);
			owner.save();
			console.log('player added\n' + owner);
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
exports.list = function(req, res) { Owner.find().sort('-created').exec(function(err, owners) { //.populate('user', 'name')
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
 * Review the roster
 */
exports.reviewRoster = function(req, res) {
	Owner.find().sort('-created').populate('keepRoster', 'price').exec(function(err, owners) { //
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
 * Get everything
 */
exports.ownersAndPlayers = function(req, res) {
	Owner.find().sort('-created').populate('keepRoster').populate('previousRoster').populate('bidRoster').exec(function(err, owners) { //
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
 * 	for the player update change the owners
 **/
exports.ownerChange = function(req, res) {
	var ownerId=req.body.ownerId,
		playerId=req.body.playerId,
		oldMarker=req.body.oldMarker,
		x;

	//need to check if things are null first
	if(ownerId==null || ownerId==''){
		console.log('nothing to change for ' + oldMarker);
		res.send('nothing to change');
	}
	else{
		Owner.findById(ownerId).exec(function(err, owner) {
			if (err) {
				console.log('didn\'t change the old owner');
				console.log(err);
			} else {
				if(oldMarker){
					//remove the owner
					for(x=0;x<owner.previousRoster.length;x++){
						if(owner.previousRoster[x]==playerId){
							owner.previousRoster.splice(x,1);
							break;
						}
					}
					for(x=0;x<owner.keepRoster.length;x++){
						if(owner.keepRoster[x]==playerId){
							owner.keepRoster.splice(x,1);
							break;
						}
					}
					for(x=0;x<owner.bidRoster.length;x++){
						if(owner.bidRoster[x]==playerId){
							owner.bidRoster.splice(x,1);
							break;
						}
					}

					owner.save();
					console.log('old owner changed');
					res.jsonp(owner);
				}else{
					//just add the owner
					owner.previousRoster.push(playerId);
					owner.save();
					console.log('new owner changed');
					res.jsonp(owner);
				}
			}
		});
	}
};


/**
 *  Change Keeper Roster ###
 **/
exports.changeKeeper = function(req, res) {
	var status=req.body.status,
		ownerId=req.body.ownerId,
		playerId=req.body.playerId,
		x;

	Owner.findById(ownerId).exec(function(err, owner) {
		if (err) {
			console.log(err);
		} else {
			if(status==1){
				console.log('add');
				//add a player to keepRoster
				owner.keepRoster.push(playerId);
				//remove a player from previousRoster
				for(x=0;x<owner.previousRoster.length;x++){
					if(owner.previousRoster[x]==playerId){
						owner.previousRoster.splice(x,1);
						break;
					}
				}
			}else{
				console.log('remove');
				//add a player to keepRoster
				owner.previousRoster.push(playerId);
				//remove a player from previousRoster
				for(x=0;x<owner.keepRoster.length;x++){
					if(owner.keepRoster[x]==playerId){
						owner.keepRoster.splice(x,1);
						break;
					}
				}
			}
			owner.save();
			console.log('after\n' + owner);
		}
	}).then(function(){
		//change the player
		Owner.findById(ownerId).populate('previousRoster').populate('bidRoster').populate('keepRoster').exec(function(err, owner) {
			if (err) {
				console.log(err);
			} else {
				res.jsonp(owner);
			}
		});
	});
};

/**
 *  Change Bid Roster ###
 **/
exports.changeBidee = function(req, res) {
	var status=req.body.status,
		ownerId=req.body.ownerId,
		playerId=req.body.playerId,
		x;

	Owner.findById(ownerId).exec(function(err, owner) {
		if (err) {
			console.log(err);
		} else {
			if(status==1){
				console.log('add');
				//add a player to keepRoster
				owner.bidRoster.push(playerId);
				//remove a player from previousRoster
				for(x=0;x<owner.previousRoster.length;x++){
					if(owner.previousRoster[x]==playerId){
						owner.previousRoster.splice(x,1);
						break;
					}
				}
			}else{
				console.log('remove');
				//add a player to keepRoster
				owner.previousRoster.push(playerId);
				//remove a player from previousRoster
				for(x=0;x<owner.bidRoster.length;x++){
					if(owner.bidRoster[x]==playerId){
						owner.bidRoster.splice(x,1);
						break;
					}
				}
			}
			owner.save();
			console.log('after\n' + owner);
		}
	}).then(function(){
		//change the player
		Owner.findById(ownerId).populate('previousRoster').populate('bidRoster').populate('keepRoster').exec(function(err, owner) {
			if (err) {
				console.log(err);
			} else {
				res.jsonp(owner);
			}
		});
	});
};

/**
 * Owner middleware
 */
exports.ownerByID = function(req, res, next, id) {
	Owner.findById(id).populate('previousRoster', 'name').exec(function(err, owner) {
		if (err) return next(err);
		if (! owner) return next(new Error('Failed to load Owner ' + id));
		req.owner = owner ;
		next();
	});
};

/**
 * edit the roster
 */
exports.editRoster = function(req, res, next) {
	Owner.findById(req.params.ownerId).populate('previousRoster').populate('bidRoster').populate('keepRoster').exec(function(err, owner) {
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
 * Owner authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.owner.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};