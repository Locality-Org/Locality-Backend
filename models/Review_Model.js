const mongoose = require('mongoose');

const schema = mongoose.Schema;

const ReviewSchema = new schema({
	user_name: {
		type: String,
		required: true,
	},
	user: {
		type: schema.Types.ObjectId,
		ref: 'User',
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
	product: {
		type: schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
});

module.exports = mongoose.model('Review', ReviewSchema);
