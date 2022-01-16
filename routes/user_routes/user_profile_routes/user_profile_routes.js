const router = require('../../../server').router;
const User = require('../../../models/User_Model');
const Category = require("../../../models/Category_Model");
const user_auth = require('../../../src/user_route_implementation/user_auth');

router.route('/addPreferences')
    .all(user_auth.verifyJwtToken)
    .get((req,res)=>{
        res.json("Add Preference GET Request");
    })
    .post(async (req,res,next)=>{
        try {
            var preferences = req.body.preferences;
            if(Array.isArray(preferences)){
                var user = await User.findOne({"_id": req.body.user_id});
                if(!user){
                    return res.status(500).json("User Not Found");
                }
                else{
                    user.preferences = preferences;
                    var saved_user = await user.save();
                    if(!saved_user){
                        return res.status(500).json("Database error. Unable to save User Data");
                    }
                    else{
                        return res.status(200).json({
                            "success": true,
                            "preference_saved": true
                        });
                    }
                }
            }
            else{
                return res.status(500).json("Preferences are not in correct Format");
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                "error": error,
                "probable_cause": "Category not defined"
            });
        }
        
        
    });


router.route('/getPreferences/:user_id')
    .all(user_auth.verifyJwtToken)
    .get(async(req,res)=>{
        try {
            var user = await User.findOne({"_id": req.params.user_id});
            if(!user){
                return res.status(500).json("User Not Found");
            }
            else{
                return res.status(200).json({
                    "success": true,
                    "user_id": user.id,
                    "mob": user.mob,
                    "preferences": user.preferences
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                "error": error
            });
        }
    })
    .post(async (req,res,next)=>{
        
        return res.status(200).json("getPreference GET request");
    });



module.exports = router;