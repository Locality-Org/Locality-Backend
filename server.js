const express = require('express');
const dotenv = require('dotenv');

// Config env Variables
dotenv.config({path: './.env'});

const app = express();
const PORT = process.env.PORT || 3000;

//Here we are configuring express to use body-parser as middle-ware.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// CORS
var cors = require('cors');
app.use(cors());
app.options('*', cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Configure Morgan
const morgan_config = require('./src/config/config_morgan');
app.use(morgan_config);

// Configure Database Connection
const connectDB = require('./src/config/config_db');
connectDB();   

////////////////////////////////////////////////////////////////////////////////////
// Routes
module.exports.router = require('express').Router();
app.get('/',(req,res)=>{
    console.log("Home page request");
    res.json("Home Page");
})

// Configure Admin routes
const admin_routes = require('./src/routes/admin_routes/admin_routes');
app.use('/admin',admin_routes);

// Configure Auth Routes
const auth_routes = require('./src/routes/user_routes/user_auth_routes/user_auth_routes');
app.use('/auth',auth_routes);

// Configure User Routes
const user_routes = require('./src/routes/user_routes/user_profile_routes/user_profile_routes');
const user_auth = require('./src/user_route_implementation/user_auth')
app.use('/user',user_routes);


// Configure Category Routes
const retailRoutes = require('./src/routes/user_routes/userRetailRoutes');
app.use('/user/retail', retailRoutes);


// Test

// var admin = require("firebase-admin");

// var serviceAccount = require("./src/config/Firebase-OTP-jwt/serviceAccount.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


// app.get('/test', async (req,res) => {
// 		try {
// 			var token = req.headers.authorization.split(' ')[1];
// 			const decodeValue = await admin.auth().verifyIdToken(token);
// 			if (decodeValue) {
// 				console.log("Decoded Value : ", decodeValue);
//                 return res.json(decodeValue);
// 			}
// 			return res.json({ message: 'Un authorize' });
// 		} catch (e) {
// 			if(e.codePrefix === 'auth'){
// 				console.log("Errror with Auth code");
// 				return res.json({ 
// 					message: 'Internal Error' ,
// 					code: 427,
// 					errorCode: e.codePrefix
// 				});
// 			}
// 			console.log("Error without Auth")
// 			return res.json({ 
// 				message: 'Internal Error' ,
// 				error: e
// 			});
// 		}
// })

////////////////////////////////////////////////////////////////////////////////////

app.listen(PORT,()=>{
    console.log(`Backend Server is running in ${process.env.NODE_ENV} mode on Port No :  ${process.env.PORT}`);
})