const router = require('express').Router();
const admin_auth = require('../../../src/admin_route_implementations/admin_auth');
const Category = require('../../../models/Category_Model');

router.route('/addCategories')
    .all(admin_auth.verifyAdminJwtToken)
    .get((req,res)=>{
        res.json("Admin GET Request");
    })
    .post(async (req,res,next)=>{
        try {
            var categories = req.body.categories;
            if(Array.isArray(categories)){
                try {
                    var categories_to_be_inserted = [];
                    categories.forEach((category) => {
                        categories_to_be_inserted.push({
                            "name": category.name,
                            "image": (category.image)?category.image:null
                        })
                    })
                    var inserted = await Category.create(categories_to_be_inserted);
                    if(inserted){
                        return res.status(200).json({
                            "success": true,
                            "categories_inserted": true
                        })
                    }
                    else{
                        return res.status(500).json({
                            "message": "DB error"
                        })
                    }
                } catch (error) {
                    res.status(500).json(error);
                }
                
            }
            else{
                return res.status(500).json("Incorrect format")
            }
            
        } catch (error) {
            return res.status(500).json(error);
        }
        
    });


module.exports = router;