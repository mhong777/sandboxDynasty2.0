'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Gvar Schema
 */

	//this is meant to be the global variables
	//should be the timer, the draft timer, pause?, start draft?, draft segment?
var GvarSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Gvar name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Gvar', GvarSchema);