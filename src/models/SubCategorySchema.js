const mongoose = require('mongoose');

const schema = mongoose.Schema;

module.exports = new schema({
	name: {
		type: String,
		required: true,
		unique: true, 
		// for testing it's done as not Unique as it's giving Error :  MongoError: E11000 duplicate key error collection: for 2 empty Subcategories array of 2 different Categories
	},
	image: {
		type: String,
		default: null,
	},
});

