const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Config env Variables
dotenv.config({path: './.env'});

module.exports = function connectDB(){
    mongoose.connect(process.env.MONGODB_ATLAS_CONNECTION_STRING,{                
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
        .then(()=>{console.log("Connected to DB ....");})
        .catch((e)=>{console.log(e);})
}