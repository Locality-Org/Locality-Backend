const mongoose = require('mongoose');


const schema = mongoose.Schema;

  
var CategorySchema = new schema({
    name: {
        type: String,
        require: true,
        unique: true,
    },
    image: {
        type: String,
        default: null
    }
})


module.exports = mongoose.model("Category",CategorySchema);