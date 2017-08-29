'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Owner Schema
 */
var OwnerSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Owner name',
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
    previousRoster:[
        {type:Schema.ObjectId, ref:'Player'}
    ],
    keepRoster:[
        {type:Schema.ObjectId, ref:'Player'}
    ],
    bidRoster:[
        {type:Schema.ObjectId, ref:'Player'}
    ],
    draftPicks:{
        type:[Number]
    },
    extraMoney:{
        type:Number,
        default: 0
    },
    myUser:{
        type: Schema.ObjectId,
        ref: 'User'
    },
    order:{
	    type:Number
    }
    
    
});

mongoose.model('Owner', OwnerSchema);