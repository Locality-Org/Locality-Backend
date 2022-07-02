const mongoose = require('mongoose');

const { Schema } = require('mongoose');

module.exports = new Schema({
	city: {
		type: String,
	},
	street: {
		type: String,
	},
	houseNumber: {
		type: String,
	},
    PIN: {
        type: Number,
		required: true,
		min: 100000,
		max: 999999,
    },
    Landmark: {
        type: String,
    },
    description: {
        type: String
    }
});