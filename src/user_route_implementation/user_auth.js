const mongoose = require('mongoose');
const User = require('../../models/User_Model');
const OTP =  require('../../models/OTP_Model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const CryptoJS = require('crypto-js');
const { vary } = require('express/lib/response');

// Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// require the Twilio module and create a REST twilio_client
const twilio_client = require('twilio')(accountSid, authToken);


// To add minutes to the current time
function AddMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

var generateJwt = function (_id, mob) {
    return jwt.sign({ 
        _id: _id,
        mob: mob
    },
        process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXP
    });
};

module.exports.register = async (req, res, next) => {
    try {
        const {mob,email,username} = req.body;
        if(mob.length !== 10){
            return res.status(500).json("Enter a valid 10 digit mob no.")
        }
        
        var user = await User.findOne({mob: mob});
        if(!user){
            return res.status(422).json({
                "success": false,
                "message": "Mob Number not verified."
            });
        }
        if(user.email || user.username){
            return res.status(500).json({
                "success": false,
                "message": "Account already exist with this Mobile number. Please try to LogIn"
            })
        }
        user.email = email;
        user.username = username;
        try {
            var saved_user = await user.save();
            if(!saved_user){
                return res.status(500).json({
                    "success": false,
                    "message": "Internal DB error. Restart the Process"
                })
            }
            return res.status(200).json({
                "success": true,
                "is_otp_verified": true,
                "message": "OTP Successfully verified & Signed Up Successfully",
                "token": generateJwt(user._id, user.mob),
                "logged_in": true
            })
        } catch (error) {
            if (error.code == 11000){
                if(User.findOne(username)){
                    return res.status(422).json({
                        "success": false,
                        "message": "Duplicate Username found."
                    });
                }
                else{
                    return res.status(422).json({
                        "success": false,
                        "message": "Duplicate email found."
                    });
                }
            }
            else{
                console.log(error);
                return res.status(500).json(error);
            }
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

module.exports.authenticate = async (req, res, next)=>{
    try {
        var mob_no = req.body.mob_no;
        const user = await User.findOne({mob:mob_no});
        if(!user){
            res.status(400).json("User doesn't exist");
        }
        return res.status(200).json({
            "success": true,
            "token": user.generateJwt()
        });
    } catch (error) {
        return res.status(500).json({
            "success": false,
            "Error": error
        })
    }
};

module.exports.verifyJwtToken = (req, res, next) => {
    var token;
    if ('authorization' in req.headers)
        token = req.headers['authorization'].split(' ')[1];

    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    else {
        jwt.verify(token, process.env.JWT_SECRET,
            (err, decoded) => {
                if (err){
                    console.log(err);
                    return res.status(500).send({ auth: false, message: 'Token authentication failed.' });
                }
                else {
                    if(decoded._id == (req.body.user_id)?req.body.user_id:req.params.user_id){
                        next();
                    }
                    else{
                        return res.status(500).json("Token Tampering");
                    }
                    
                }
            }
        )
    }
}

module.exports.sendOTP = async (req, res, next) => {
    try {
        var sender_twilio_mob_no = process.env.TWILIO_MOB_NO,
            receiver_mob_no = req.body.mob;
        if(!receiver_mob_no || receiver_mob_no.toString().length != 10){
            return res.status(500).json({
                "success": false,
                "message": "Enter a valid Mobile No"
            })
        }

        //Generate OTP 
        const otp = otpGenerator.generate(6, { alphabets: false, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        const now = new Date();
        const expiration_time = AddMinutesToDate(now,10);

        var new_otp_object = await new OTP({
            otp: otp,
            expiration_time: expiration_time
        }).save();

        if(!new_otp_object){
            return res.status(500).json({
                "success": false,
                "message": "Internal Database Error"
            })
        }

        var otp_details = {
            "timestamp": now, 
            "mob": receiver_mob_no, 
            "success": true, 
            "message":"OTP sent to the user", 
            "otp_id": new_otp_object._id
        }

        try {
            const encoded = CryptoJS.AES.encrypt(JSON.stringify(otp_details), process.env.OTP_Secret);
            // return res.status(200).json(typeof encoded.toString());
            twilio_client.messages
                .create({
                to: "+91"+receiver_mob_no,
                from: sender_twilio_mob_no,
                body: "From Rush : OTP for verifying mob number is "+otp,
                })
                .then(message => {
                    return res.status(200).json({
                        "success": true,
                        "message": "OTP sent successfully",
                        "verification_key": encoded.toString()
                    })
                }).catch(error => {
                    console.log(error);
                    return res.status(500).json({
                        "success": false,
                        "message": "BAD Request",
                        "Error": error
                    })
                });
        } catch (error) {
            return res.status(500).send(error);
        }
        
        
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

module.exports.verifyOTP = async (req, res, next) => {
    try {
        
        var currentTime = new Date(); 
        const {verification_key, otp, mob} = req.body;

        if(!verification_key){
            return res.status(200).json({
                "success": false,
                "message": "No Verification Key Provided"
            })
        }
        if(!otp){
            return res.status(500).json({
                "success": false,
                "message": "OTP Not Provided"
            })
        }
        if(!mob){
            return res.status(500).json({
                "success": false,
                "message": "Mobile Number not Provided"
            })
        }

        var decoded ;
        try {
            decoded = CryptoJS.AES.decrypt(verification_key, process.env.OTP_Secret);
        } catch (error) {
            return res.status(500).json({
                "success": false,
                "message": "Verification Key Tampering"
            })
        }

        if(!decoded){
            return res.status(500).json({
                "success": false,
                "message": "Verification Key Tampering"
            })
        }
        decoded = JSON.parse(decoded.toString(CryptoJS.enc.Utf8));
        if(decoded.mob != mob){
            return res.status(500).json({
                "success": false,
                "message": "OTP was not sent to this particular phone number"
            })
        }
        
        var existing_otp_object = await OTP.findById(decoded.otp_id);
        if(!existing_otp_object){
            return res.status(500).json({
                "success": false,
                "message": "Incorrect OTP."
            })
        }

        if(currentTime > existing_otp_object.expiration_time){
            return res.status(500).json({
                "success": false,
                "message": "OTP Expired. Restart the process again."
            })
        }

        if(otp != existing_otp_object.otp){
            return res.status(500).json({
                "success": false,
                "message": "Incorrect OTP"
            })
        }

        
        // OTP is verified successfully
        OTP.deleteOne({
            "_id": decoded.otp_id
        },async (err, success)=>{
            if(err){
                return res.status(500).json({
                    "success": false,
                    "message": "Internal DB error. Restart the Process"
                })
            }
            // SUCCESS
            var user = await User.findOne({mob:mob});
            if(!user){
                try {
                    var saved_user = await new User({
                        mob: mob
                    }).save();
                    if(!saved_user){
                        return res.status(500).json({
                            "success": false,
                            "message": "Internal DB error. Restart the Process"
                        })
                    }
    
                    return res.status(200).json({
                        "success": true,
                        "is_otp_verified": true,
                        "message": "OTP Successfully verified",
                        "token": generateJwt(saved_user._id, saved_user.mob),
                        "logged_in": false,
                        "signup_required": true,
                        "user_id": saved_user._id
                    })
                } catch (error) {
                    if (error.code == 11000){
                        if(User.findOne(user.mob)){
                            return res.status(422).json({
                                "success": false,
                                "message": "Duplicate mob_no found."
                            });
                        }
                    }
                    else{
                        console.log(error);
                        return res.status(500).json(error);
                    }
                
                }
            }
            if(!user.email || !user.username){
                var saved_user = await User.findOne({
                    mob: mob
                });
                return res.status(200).json({
                    "success": true,
                    "is_otp_verified": true,
                    "message": "OTP Successfully verified",
                    "token": generateJwt(user._id, user.mob),
                    "logged_in": false,
                    "signup_required": true,
                    "user_id": user._id
                })
            }
            return res.status(200).json({
                "success": true,
                "is_otp_verified": true,
                "message": "OTP Successfully verified & Logged In Successfully",
                "token": generateJwt(user._id, user.mob),
                "logged_in": true,
                "user_id": user._id
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}