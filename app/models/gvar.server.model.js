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
	draftOrder:[
		{type:Schema.ObjectId, ref:'Owner'}
	],
	salaryCap:{
		type:Number,
		default: 0
	},
	keeperCap:{
		type:Number,
		default: 0
	},
	maxPlayers:{
		type:Number,
		default: 0
	},
	timer:{
		type:Number,
		default: 0
	},
	pickTimer:{
		type:Number,
		default: 0
	},
	bidTimer:{
		type:Number,
		default: 0
	},
	upNext: {
		type:Schema.ObjectId, ref:'Player'
	},
	draftTime:{
		type: Boolean,
		default: false
	},
	bidShow:{
		type: Boolean,
		default: false
	},
	matchShow:{
		type: Boolean,
		default: false
	},
	timerShow:{
		type: Boolean,
		default: false
	},
	draftShow:{
		type: Boolean,
		default: false
	},
	rookieDraft:{
		type: Boolean,
		default: false
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Gvar', GvarSchema);