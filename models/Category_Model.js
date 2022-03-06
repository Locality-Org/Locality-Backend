const mongoose = require('mongoose');

const schema = mongoose.Schema;

const SubCategorySchema = new schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	image: {
		type: String,
		required: false,
		default: null,
	},
});

const CategorySchema = new schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	image: {
		type: String,
		required: false,
		default: null,
	},
	subcategories: [
		{
			type: SubCategorySchema,
		},
	],
});

module.exports = mongoose.model('Category', CategorySchema);
