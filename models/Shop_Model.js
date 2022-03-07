const mongoose = require('mongoose');
const AddressSchema = require('./Address_Schema');

const schema = mongoose.Schema;

const ShopSchema = new schema({
	name: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: false,
	},
	ratings: {
		type: Number,
		required: false,
		default: null, // New Shop
	},
	location: {
		latitute: {
			type: Number,
			required: true,
		},
		longitude: {
			type: Number,
			required: true,
		},
	},
	address: {
		type: AddressSchema,
		required: true,
	},

	mobile: {
		type: Number,
		required: true,
		min: 1000000000,
		max: 9999999999,
	},
	instagram: {
		type: String,
		required: false,
	},
	facebook: {
		type: String,
		required: false,
	},
	website: {
		type: String,
		required: false,
	},
});

module.exports = mongoose.model('Shop', ShopSchema);
