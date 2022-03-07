const mongoose = require('mongoose');

const schema = mongoose.Schema;

const ReviewSchema = new schema({
	user_name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	media: [
		{
			type: String,
			required: false,
		},
	],
});

const DiscountCouponSchema = new schema({
	discount_percentage: {
		type: Number,
		required: true,
		min: 0,
		max: 100,
	},
	max_discount_rs: {
		type: Number,
		required: false,
	},
	min_order_value: {
		type: Number,
		required: false,
	},
	code: {
		type: String,
		required: true,
	},
});

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
	seller: {
		type: schema.Types.ObjectId,
		ref: 'Shop',
		required: true,
	},
	reviews: [
		{
			type: ReviewSchema,
		},
	],
	discount_coupons: [
		{
			type: DiscountCouponSchema,
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
