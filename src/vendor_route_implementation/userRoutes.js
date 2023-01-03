const User = require('../models/Vendor_Model');
const Category = require('../models/Category_Model');


module.exports.getUserDetails = async (req, res, next) => {
    try {
        var phone_number = req.body.phone_number;
        if (phone_number.length != 10) {
            return res.json({
                success: false,
                errorCode: 431,
                message: "Please Send the correct Pnone Number without +91"
            });
        }

        const user = await User.findOne({ mob: phone_number });
        if (user) {
            return res.status(200).json({
                user
            });
        }

        return res.json({
            signUpRequired: true,
            errorCode: 231
        });
    } catch (error) {

    }
}

module.exports.getAllCategories = async (req, res, next) => {
    try {

        const categories = await Category.find();
        if (categories) {
            return res.status(200).json({
                categories
            });
        }

        return res.json({
            message: "Internal DB Error ",
            errorCode: 561
        });
    } catch (error) {
        return res.status(500).json({
            errorCode: 500,
            message: "Internal DB Error"
        })
    }
}