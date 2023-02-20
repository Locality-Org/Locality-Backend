const mongoose = require('mongoose');
const Vendor = require('../models/Vendor_Model');
const OTP = require('../models/OTP_Model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const CryptoJS = require('crypto-js');
const { vary } = require('express/lib/response');
const fbAdmin = require('../config/Firebase-OTP-jwt/firebase-otp-jwt-config');


// Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// require the Twilio module and create a REST twilio_client
const twilio_client = require('twilio')(accountSid, authToken);


// To add minutes to the current time
function AddMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
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
        const { mob, email, username, profilePicture, preferences, isEmailVerified, userId, businessName, address, GSTIN } = req.body;
        if (mob == undefined) {
            return res.status(500).json({
                success: false,
                errorCode: 541,
                message: "Enter a valid Mobile Number"
            });
        }

        if (mob.length !== 10) {
            return res.status(500).json("Enter a valid 10 digit mob no.")
        }
        // if (email == undefined) {
        //     return res.status(500).json({
        //         success: false,
        //         errorCode: 542,
        //         message: "Enter a valid Email ID"
        //     });
        // }
        // if (preferences == undefined) {
        //     return res.status(500).json({
        //         success: false,
        //         errorCode: 543,
        //         message: "Enter Valid Preferences"
        //     });
        // }
        // if (isEmailVerified == undefined) {
        //     return res.status(500).json({
        //         success: false,
        //         errorCode: 544,
        //         message: "Enter isEmailVerified Status"
        //     });
        // }
        if (businessName == undefined) {
            return res.status(500).json({
                success: false,
                errorCode: 545,
                message: "Enter valid business name"
            });
        }
        if (userId == undefined) {
            return res.status(500).json({
                success: false,
                errorCode: 546,
                message: "Enter User ID"
            });
        }

        var user = await Vendor.findOne({ mob: mob });
        if (user) {
            return res.status(500).json({
                "success": false,
                errorCode: 441,
                "message": "Account already exist with this Mobile number. Please try to LogIn"
            })
        }

        user = await Vendor.findOne({ email: email });
        if (user) {
            return res.status(500).json({
                "success": false,
                errorCode: 442,
                "message": "Account already exist with this Email ID. Please try to LogIn"
            });
        }

        try {
            var savedUser = await new Vendor({
                userId: userId,
                mob: mob,
                email: email,
                isEmailVerified: isEmailVerified,
                username: username,
                profilePicture: profilePicture ? profilePicture : null,
                preferences: preferences,
                businessName: businessName,
                address: address,
                GSTIN: GSTIN
            }).save();
            if (savedUser) {
                return res.status(200).json(savedUser);
            }
            return res.status(500).json({
                errorCode: 505
            })
        } catch (error) {
            return res.status(500).json({
                errorCode: 500,
                error: error
            })
        }


        try {
            var newUser = await new Vendor({
                mob: mob
            }).save();
            return res.status(200).json({
                "success": true,
                "is_otp_verified": true,
                "message": "OTP Successfully verified & Signed Up Successfully",
                "token": generateJwt(user._id, user.mob),
                "logged_in": true
            })
        } catch (error) {
            if (error.code == 11000) {
                if (Vendor.findOne(username)) {
                    return res.status(422).json({
                        "success": false,
                        "message": "Duplicate Username found."
                    });
                }
                else {
                    return res.status(422).json({
                        "success": false,
                        "message": "Duplicate email found."
                    });
                }
            }
            else {
                console.log(error);
                return res.status(500).json(error);
            }
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

module.exports.authenticate = async (req, res, next) => {
    try {
        var mob_no = req.body.mob_no;
        const user = await Vendor.findOne({ mob: mob_no });
        if (!user) {
            res.status(400).json("Vendor doesn't exist");
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

module.exports.verifyJwtToken = async (req, res, next) => {

    const token = req.headers.authorization.split(' ')[1];
    try {
        const decodeValue = await admin.auth().verifyIdToken(token);
        if (decodeValue) {
            req.user = decodeValue;
            return next();
        }
        return res.json({ message: 'Un authorize' });
    } catch (e) {
        return res.json({ message: 'Internal Error' });
    }

}

module.exports.sendOTP = async (req, res, next) => {
    try {
        var sender_twilio_mob_no = process.env.TWILIO_MOB_NO,
            receiver_mob_no = req.body.mob;
        if (!receiver_mob_no || receiver_mob_no.toString().length != 10) {
            return res.status(500).json({
                "success": false,
                "message": "Enter a valid Mobile No"
            })
        }

        //Generate OTP 
        const otp = otpGenerator.generate(6, { alphabets: false, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        const now = new Date();
        const expiration_time = AddMinutesToDate(now, 10);

        var new_otp_object = await new OTP({
            otp: otp,
            expiration_time: expiration_time
        }).save();

        if (!new_otp_object) {
            return res.status(500).json({
                "success": false,
                "message": "Internal Database Error"
            })
        }

        var otp_details = {
            "timestamp": now,
            "mob": receiver_mob_no,
            "success": true,
            "message": "OTP sent to the user",
            "otp_id": new_otp_object._id
        }

        try {
            const encoded = CryptoJS.AES.encrypt(JSON.stringify(otp_details), process.env.OTP_Secret);
            // return res.status(200).json(typeof encoded.toString());
            twilio_client.messages
                .create({
                    to: "+91" + receiver_mob_no,
                    from: sender_twilio_mob_no,
                    body: "From Rush : OTP for verifying mob number is " + otp,
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
        const { verification_key, otp, mob } = req.body;

        if (!verification_key) {
            return res.status(200).json({
                "success": false,
                "message": "No Verification Key Provided"
            })
        }
        if (!otp) {
            return res.status(500).json({
                "success": false,
                "message": "OTP Not Provided"
            })
        }
        if (!mob) {
            return res.status(500).json({
                "success": false,
                "message": "Mobile Number not Provided"
            })
        }

        var decoded;
        try {
            decoded = CryptoJS.AES.decrypt(verification_key, process.env.OTP_Secret);
        } catch (error) {
            return res.status(500).json({
                "success": false,
                "message": "Verification Key Tampering"
            })
        }

        if (!decoded) {
            return res.status(500).json({
                "success": false,
                "message": "Verification Key Tampering"
            })
        }
        decoded = JSON.parse(decoded.toString(CryptoJS.enc.Utf8));
        if (decoded.mob != mob) {
            return res.status(500).json({
                "success": false,
                "message": "OTP was not sent to this particular phone number"
            })
        }

        var existing_otp_object = await OTP.findById(decoded.otp_id);
        if (!existing_otp_object) {
            return res.status(500).json({
                "success": false,
                "message": "Incorrect OTP."
            })
        }

        if (currentTime > existing_otp_object.expiration_time) {
            return res.status(500).json({
                "success": false,
                "message": "OTP Expired. Restart the process again."
            })
        }

        if (otp != existing_otp_object.otp) {
            return res.status(500).json({
                "success": false,
                "message": "Incorrect OTP"
            })
        }


        // OTP is verified successfully
        OTP.deleteOne({
            "_id": decoded.otp_id
        }, async (err, success) => {
            if (err) {
                return res.status(500).json({
                    "success": false,
                    "message": "Internal DB error. Restart the Process"
                })
            }
            // SUCCESS
            var user = await User.findOne({ mob: mob });
            if (!user) {
                try {
                    var saved_user = await new User({
                        mob: mob
                    }).save();
                    if (!saved_user) {
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
                    if (error.code == 11000) {
                        if (User.findOne(user.mob)) {
                            return res.status(422).json({
                                "success": false,
                                "message": "Duplicate mob_no found."
                            });
                        }
                    }
                    else {
                        console.log(error);
                        return res.status(500).json(error);
                    }

                }
            }
            if (!user.email || !user.username) {
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

module.exports.verifyFBToken = async (req, res, next) => {
    try {
        var token = req.headers.authorization.split(' ')[1];
        const decodeValue = await fbAdmin.auth().verifyIdToken(token);
        if (decodeValue) {
            console.log(decodeValue);
            return res.status(200).json({
                success: true,
                user_id: decodeValue.user_id,
                phone_number: decodeValue.phone_number
            });
        }
        return res.json({
            message: 'Un authorize',
            errorCode: 527,
        });
    } catch (e) {
        if (e.codePrefix === 'auth') {
            console.log(e);
            return res.json({
                message: 'Internal Error',
                errorCode: 427,
                codePrefix: e.codePrefix
            });
        }
        console.log("Error without Auth : ", e)
        return res.json({
            message: 'Internal Error',
            error: e,
            errorCode: 500
        });
    }
}

module.exports.verifyFBTokenMiddleWare = async (req, res, next) => {
    try {
        var token = req.headers.authorization.split(' ')[1];
        const decodeValue = await fbAdmin.auth().verifyIdToken(token);
        if (decodeValue) {
            return next();
        }
        return res.json({
            message: 'Un authorize',
            errorCode: 527,
        });
    } catch (e) {
        if (e.codePrefix === 'auth') {
            console.log(e);
            return res.json({
                message: 'Internal Error',
                errorCode: 427,
                codePrefix: e.codePrefix
            });
        }
        console.log("Error without Auth : ", e);
        return res.json({
            message: 'Internal Error',
            error: e,
            errorCode: 500
        });
    }
}

module.exports.verifyAdminFBToken = async (req, res, next) => {
    try {
        var token = req.headers.authorization.split(' ')[1];
        const decodeValue = await fbAdmin.auth().verifyIdToken(token);
        if (decodeValue) {
            console.log(decodeValue);
            var mob = decodeValue.phone_number.substring(3);
            var user = await User.findOne({ mob: mob });
            if (!user) {
                return res.status(481).json({
                    success: false,
                    phone_number: decodeValue.phone_number,
                    message: 'User with Mobile Number not found.'
                });
            }
            if (user.isAdmin) {
                return res.status(200).json({
                    success: true,
                    user_id: decodeValue.user_id,
                    phone_number: decodeValue.phone_number
                });
            }
            return res.status(482).json({
                success: false,
                phone_number: decodeValue.phone_number,
                message: "Only ADMIN can access the route"
            });
        }
        return res.json({
            message: 'Un authorize',
            errorCode: 527,
        });
    } catch (e) {
        if (e.codePrefix === 'auth') {
            console.log(e);
            return res.json({
                message: 'Internal Error',
                errorCode: 427,
                codePrefix: e.codePrefix
            });
        }
        console.log("Error without Auth : ", e);
        return res.json({
            message: 'Internal Error',
            error: e,
            errorCode: 500
        });
    }
}

module.exports.verifyAdminFBTokenMiddleWare = async (req, res, next) => {
    try {
        var token = req.headers.authorization.split(' ')[1];
        const decodeValue = await fbAdmin.auth().verifyIdToken(token);
        if (decodeValue) {
            var mob = decodeValue.phone_number.substring(3);
            var user = await User.findOne({ mob: mob });
            if (!user) {
                return res.status(481).json({
                    success: false,
                    phone_number: decodeValue.phone_number,
                    message: 'User with Mobile Number not found.'
                });
            }
            if (user.isAdmin) {
                return next();
            }
            return res.status(482).json({
                success: false,
                phone_number: decodeValue.phone_number,
                message: "Only ADMIN can access the route"
            });
        }
        return res.json({
            message: 'Un authorize',
            errorCode: 527,
        });
    } catch (e) {
        if (e.codePrefix === 'auth') {
            console.log(e);
            return res.json({
                message: 'Internal Error',
                errorCode: 427,
                codePrefix: e.codePrefix
            });
        }
        console.log("Error without Auth : ", e);
        return res.json({
            message: 'Internal Error',
            error: e,
            errorCode: 500
        });
    }
}
