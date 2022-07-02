const mongoose = require('mongoose');
const schema = mongoose.Schema;

const SubCategorySchema = require('./SubCategorySchema');
  
var CategorySchema = new schema({
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
	subcategories: [
		{
			type: SubCategorySchema,
		},
	]
})


module.exports = mongoose.model("Category",CategorySchema);