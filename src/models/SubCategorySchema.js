const mongoose = require('mongoose');

const schema = mongoose.Schema;

module.exports = new schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	image: {
		type: String,
		required: true,
		default: null,
	},
});

