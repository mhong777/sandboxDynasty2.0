'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Sale Schema
 */
var SaleSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Sale name',
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

mongoose.model('Sale', SaleSchema);