const mongoose = require('mongoose');

const schema = mongoose.Schema;

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
	product: {
		type: schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
});

module.exports = mongoose.model('DiscountCoupon', DiscountCouponSchema);
