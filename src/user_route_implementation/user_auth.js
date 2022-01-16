const mongoose = require('mongoose');
const User = require('../../models/User_Model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports.register = (req, res, next) => {
    try {
        const {mob_no,email,username,password} = req.body;
        if(mob_no.length !== 10){
            return res.status(500).json("Enter a valid 10 digit mob no.")
        }
        const hashed_password = bcrypt.hashSync(req.body.password,parseInt(process.env.PASSWORD_HASH_CONST));


        var new_user = new User({
            mob:mob_no,email,username,password:hashed_password
        });
        new_user.save((err, doc) => {
            if(!err){
                return res.status(200).json({
                    "_id" : doc['_id'],
                    "token" : new_user.generateJwt()
                })
            }
            else{
                if (err.code == 11000){
                    if(User.findOne(user.username)){
                        res.status(422).send(['Duplicate username found.']);
                    }
                    else{
                        res.status(422).send(['Duplicate email found.']);
                    }
                }
                else{
                    console.log(err);
                    return res.status(500).json(err);
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.staus(error.code).send(error);
    }
}

module.exports.authenticate = async (req, res, next)=>{
    
    try {
        var mob_no = req.body.mob_no,
            password = req.body.password;
        const user = await User.findOne({mob:mob_no});
        if(!user){
            res.status(400).json("User doesn't exist");
        }
        else{
            var is_password_correct = user.verifyPassword(password);
            if(is_password_correct){
                return res.status(200).json({
                    "token": user.generateJwt()
                });
            }
            else{
                return res.status(500).json("Invalid Password");
            }
        }
    } catch (error) {
        
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