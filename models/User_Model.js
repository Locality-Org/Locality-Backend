const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AddressSchema = require('./Address_Schema');

const schema = mongoose.Schema;

var UserSchema = new schema({
	mob: {
		type: String,
		require: true,
		unique: true,
	},
	email: {
		type: String,
		unique: true,
	},
	username: {
		type: String,
	},
	password: {
		type: String,
		default: null,
	},
	delivery_address: [{ type: AddressSchema }],
	preferences: [
		{
			type: schema.Types.ObjectId,
			ref: 'Category',
		},
	],
	isAdmin: {
		type: Boolean,
		default: false,
	},
	cart: [
		{
			type: schema.Types.ObjectId,
			ref: 'Product',
		},
	],
});

// Methods
UserSchema.methods.verifyPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJwt = function () {
	return jwt.sign(
		{
			_id: this._id,
			mob: this.mob,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXP,
		}
	);
};

module.exports = mongoose.model('User', UserSchema);
