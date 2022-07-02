const mongoose = require('mongoose');
const Category = require('./Category_Model');
const Product = require('./ProductModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const schema = mongoose.Schema;

const AddressSchema = require('./AddressSchema');
  
var UserSchema = new schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    mob: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    username: {
        type: String,
    },
    delivery_address: [
        {type: AddressSchema}
    ],
    preferences: [
        {
			type: schema.Types.ObjectId,
			ref: 'Category',
		}
    ],
    isAdmin: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    cart: [
		{
			type: schema.Types.ObjectId,
			ref: 'Product',
		},
	],
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