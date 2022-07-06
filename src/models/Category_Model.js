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
		default: null,
	},
	subcategories: [
		{
			type: SubCategorySchema,
			default: null
		}
	]
})


module.exports = mongoose.model("Category",CategorySchema);