'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Player Schema
 */
var PlayerSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Player name',
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
    position:{
        type: String,
        default: ''
    },
    team:{
        type: String,
        default: ''
    },
    price:{
        type: Number,
        default: 0
    },
    available:{
        type: Boolean,
        default:true        
    },
    yearsOwned:{
        type: Number,
        default: 0
    },
    preSeasonRank:{
        abs:{type:Number, default: 500},
        pos:{type:Number, default: 500}
    },
    lastYearRank:{
        abs:{type:Number, default: 500},
        pos:{type:Number, default: 500}
    },
    owner:{
        type: Schema.ObjectId,
        ref: 'Owner'
    },
    rookie:{
        type: Boolean,
        default: false
    }
    
});

mongoose.model('Player', PlayerSchema);