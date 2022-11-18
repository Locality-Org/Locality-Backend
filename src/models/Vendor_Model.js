const mongoose = require('mongoose');
const Category = require('./Category_Model');
const Product = require('./ProductModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const schema = mongoose.Schema;

const AddressSchema = require('./AddressSchema');

var VendorSchema = new schema({
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
    businessName: {
        required: true,
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    pin: {
        type: String,
    },
    GSTIN: {
        type: String,
    },
    address: [
        {
            type: AddressSchema,
            required: true,
        }
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
VendorSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

VendorSchema.methods.generateJwt = function () {
    return jwt.sign({
        _id: this._id,
        mob: this.mob
    },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXP
        });
};

module.exports = mongoose.model("Vendor", VendorSchema);