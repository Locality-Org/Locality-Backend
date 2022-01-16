const mongoose = require('mongoose');
const Category = require('./Category_Model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const schema = mongoose.Schema;

const AddressSchema = mongoose.Schema({
    city: String,
    street: String,
    houseNumber: String,
});
  
var UserSchema = new schema({
    mob: {
        type: String,
        require: true,
        unique: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    delivery_address: [
        {type: AddressSchema}
    ],
    preferences: [
        {
            type: mongoose.Schema.Types.String,
            ref: Category    
        }
    ],
    isAdmin: {
        type: Boolean,
        default: false
    }
})

// Methods
UserSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJwt = function () {
    return jwt.sign({ 
        _id: this._id,
        mob: this.mob
    },
        process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXP
    });
};

module.exports = mongoose.model("User",UserSchema);