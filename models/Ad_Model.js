const mongoose = require('mongoose');

const schema = mongoose.Schema;

const AdSchema = new schema({
	media: {
		type: String,
		require: true,
	},
	parent: {
		type: schema.Types.ObjectId,
		required: false,
		refPath: 'section',
	},
	section: {
		type: String,
		required: false,
		enum: ['Category', 'Shop', 'Product'],
	},
});

module.exports = mongoose.model('Category', AdSchema);
