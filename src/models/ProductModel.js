const mongoose = require('mongoose');

const schema = mongoose.Schema;

const ProductSchema = new schema({
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
		default: null, // New Product
	},
	discount: {
		type: Number,
		required: false,
	},
	price: {
		type: Number,
		required: true,
	},
	category: {
		type: schema.Types.ObjectId,
		ref: 'Category',
		required: true,
	},
	subcategory: {
		type: schema.Types.ObjectId,
		ref: 'Category',
		required: true,
	},
	seller: {
		type: schema.Types.ObjectId,
		ref: 'Shop',
		required: true,
	},
	reviews: [
		{
			type: schema.Types.ObjectId,
			ref: 'Review',
			required: false,
		},
	],
    size: {
		type: String,
		required: false,
	},
	variations: [
		{
			size: {
				type: String,
				required: true,
			},
			price: {
				type: Number,
				required: true,
			},
			discount: {
				type: Number,
				required: false,
			},
		},
	],
	description_list: [
		{
			heading: {
				type: String,
				required: false,
			},
			description: {
				type: String,
				required: true,
			},
		},
	],
});

module.exports = mongoose.model('Product', ProductSchema);