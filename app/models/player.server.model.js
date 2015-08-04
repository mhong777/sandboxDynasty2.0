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
    price:{
        type: Number,
        default: 1
    },
    available:{
        type: Boolean,
        default:true        
    },
    yearsOwned:{
        type: Number,
        default: 0
    },
    owner:{
        type: Schema.ObjectId,
        ref: 'Owner'
    },
    rookie:{
        type: Boolean,
        default: false
    },
    team:{
        name:{
            type: String,
            default: ''
        },
        byeWeek:{
            type: Number,
            default: 0
        }
    },
    absRank:{
        type: Number,
        default: 300
    },
    posRank:{
        type: Number,
        default: 300
    }

    
});

mongoose.model('Player', PlayerSchema);