const mongoose = require('mongoose');


const schema = mongoose.Schema;

  
var OTPSchema = new schema({
    otp: {
        type: String,
        require: true,
        unique: true,
    },
    expiration_time: {
        type: Date,
        default: null
    }
}, { timestamps: true });


module.exports = mongoose.model("OTP",OTPSchema);