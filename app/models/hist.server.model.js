'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Hist Schema
 */
var HistSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Hist name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	owner:{
		type: String,
		default: ''
	},
	price:{
		type: Number,
		default: 1
	},
	player:{
		type: String,
		default: ''
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Hist', HistSchema);