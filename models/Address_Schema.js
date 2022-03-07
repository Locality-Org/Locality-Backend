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
});
