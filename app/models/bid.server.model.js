'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Bid Schema
 */
var BidSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Bid name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	owner:{
		type: Schema.ObjectId,
		ref: 'Owner'
	},
	price:{
		type: Number,
		default: 1
	},
	player:{
		type: Schema.ObjectId,
		ref: 'Player'
	},
	origOwner:{
		type: Schema.ObjectId,
		ref: 'Owner'
	}

});

mongoose.model('Bid', BidSchema);