'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Bidlog Schema
 */
var BidlogSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Bidlog name',
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

mongoose.model('Bidlog', BidlogSchema);