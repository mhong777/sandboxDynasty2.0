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
	pickOrder:[
		{type:Schema.ObjectId, ref:'Owner'}
	],
	drafter: {
		type:Schema.ObjectId, ref:'Owner'
	},
	drafterName: {
		type: String,
		default: ''
	},
	upNext: {
		type:Schema.ObjectId, ref:'Player'
	},
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
	draftPosition:{
		type:Number,
		default: 0
	},
	bidPosition:{
		type:Number,
		default: 0
	},
	rfaTimer:{
		type:Number,
		default: 0
	},
	matchTimer:{
		type:Number,
		default: 0
	},
	pickTimer:{
		type:Number,
		default: 0
	},
	nomTimer:{
		type:Number,
		default: 0
	},
	bidTimer:{
		type:Number,
		default: 0
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
	nomShow:{
		type: Boolean,
		default: false
	},
	rfaDraft:{
		type: Boolean,
		default: false
	},
	rookieDraft:{
		type: Boolean,
		default: false
	},
	auctionDraft:{
		type: Boolean,
		default: false
	},
	snakeDraft:{
		type: Boolean,
		default: false
	},
	headerMsg:{
		type: String,
		default: ''
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Gvar', GvarSchema);