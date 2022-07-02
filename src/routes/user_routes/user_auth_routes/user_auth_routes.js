const router = require('express').Router();
const User = require('../../../models/User_Model');
const user_auth = require('../../../user_route_implementation/user_auth');
const generate_access_token = require('../../../config/config_access_token').generate_access_token;
const bcrypt = require('bcryptjs');



router.route('/verifyFBToken')
    .get((req,res)=>{
        res.json("verifyFBToken GET Request");
    })
    .post((req,res,next)=>{
        user_auth.verifyFBToken(req,res,next);
    });

router.route('/login')
    .all(user_auth.verifyFBTokenMiddleWare)
    .get((req,res)=>{
        res.json("LogIn Page GET Request");
    })
    .post((req,res,next)=>{
        user_auth.authenticate(req,res,next);
    });

router.route('/signup')
    .all(user_auth.verifyFBTokenMiddleWare)
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

router.route('/sendOTP/:mob_no')
    .get((req,res)=>{
        // return res.json(req.params.mob_no);


        const phoneNumber = "+91"+req.params.mob_no;
        // const appVerifier = window.recaptchaVerifier;

        const auth = firebaseAuth.getAuth();
        firebaseAuth.signInWithPhoneNumber(auth, phoneNumber, new firebaseAuth.RecaptchaVerifier('recaptcha-container', {}, auth))
            .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            // window.confirmationResult = confirmationResult;
            console.log(confirmationResult);

            return res.status(200).json("OTP Sent Successfully");
            // ...
            }).catch((error) => {
            // Error; SMS not sent
            return res.status(500).json("An Error occured");
            // ...
            });
    })
    .post(async (req,res,next)=>{
        user_auth.verifyOTP(req,res,next);
    })

router.route('/verifyOTP/:mob_no/:otp')
    .get((req,res)=>{
        confirmationResult.confirm(req.params.otp).then((result) => {
        // User signed in successfully.
        const user = result.user;
        console.log(result);

        return res.status(200).json("OTP verified");
        // ...
        }).catch((error) => {
        // User couldn't sign in (bad verification code?)
        return res.status(500).json("An Error occured");

        // ...
        });
    })
    .post(async (req,res,next)=>{
        user_auth.verifyOTP(req,res,next);
    })
module.exports = router;