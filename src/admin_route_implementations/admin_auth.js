const router = require('express').Router();
const User = require('../models/User_Model');
const jwt = require('jsonwebtoken');

module.exports.verifyAdminJwtToken = (req, res, next) => {
    try {
        var token;
        if ('authorization' in req.headers)
            token = req.headers['authorization'].split(' ')[1];

        if (!token)
            return res.status(403).send({ auth: false, message: 'No token provided.' });
        else {
            jwt.verify(token, process.env.JWT_SECRET,
                async (err, decoded) => {
                    if (err){
                        console.log(err);
                        return res.status(500).send({ auth: false, message: 'Token authentication failed.' });
                    }
                    else {
                        try {
                            const admin = await User.findOne({"_id": decoded._id});
                            if(!admin){
                                return res.status(500).json("User Not found");
                            }
                            else{
                                if(admin.isAdmin){
                                    if(req.body.admin_id === decoded._id){
                                        next();
                                    }
                                    else{
                                        return res.status(500).json("Token Tampering");
                                    }
                                }
                                else{
                                    return res.status(500).json("Don't have required access");
                                }
                            }
                        } catch (error) {
                            console.log("Inside")
                            console.log(error)
                            res.status(500).json({error});
                        }
                        
                    }
                }
            )
        }
    } catch (error) {
        res.status(500).json(error);
    }
    
}
