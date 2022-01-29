const router = require('express').Router();
const User = require('../../../models/User_Model');
const user_auth = require('../../../src/user_route_implementation/user_auth');
const generate_access_token = require('../../../config/config_access_token').generate_access_token;
const bcrypt = require('bcryptjs');

router.route('/login')
    .get((req,res)=>{
        res.json("LogIn Page GET Request");
    })
    .post((req,res,next)=>{
        user_auth.authenticate(req,res,next);
    });

router.route('/signup')
    .all(user_auth.verifyJwtToken)
    .get((req,res)=>{
        return res.json("SignUp Page GET Request");
    })
    .post(async (req,res,next)=>{
        user_auth.register(req,res,next);
    })

router.route('/sendOTP')
    .get((req,res)=>{
        return res.json("SendOTP Page GET Request");
    })
    .post(async (req,res,next)=>{
        user_auth.sendOTP(req,res,next);
    })

router.route('/verifyOTP')
    .get((req,res)=>{
        return res.json("VerifyOTP Page GET Request");
    })
    .post(async (req,res,next)=>{
        user_auth.verifyOTP(req,res,next);
    })


module.exports = router;