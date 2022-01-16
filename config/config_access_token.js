const jwt = require('jsonwebtoken');

module.exports.generate_access_token = (email)=>{
    // return jwt.sign(email,process.env.TOKEN_SECRET,{expiresIn: '1d'});
    return jwt.sign(email,process.env.TOKEN_SECRET,{expiresIn: '1000'});
}



module.exports = (passport)=>{
    
}
module.exports.authenticate_access_token = (req,res,next)=>{

}
