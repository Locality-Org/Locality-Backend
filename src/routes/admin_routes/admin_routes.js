const router = require('express').Router();
const admin_auth = require('../../admin_route_implementations/admin_auth');
const Category = require('../../models/Category_Model');
const user_auth = require('../../user_route_implementation/user_auth');


router.route('/addCategories')
    .all(user_auth.verifyAdminFBTokenMiddleWare)
    .get((req,res)=>{
        res.json("Admin addCategories GET Request");
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
                            "image": category.image!=undefined?category.image:null
                        })
                    })
                    var inserted = await Category.create(categories_to_be_inserted, { sparse: true });
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
                    console.log("Error : ", error);
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

router.route('/addSubCategories')
    .all(user_auth.verifyAdminFBTokenMiddleWare)
    .get((req,res)=>{
        res.json("Admin addSubCAtegories GET Request");
    })
    .post(async (req,res,next)=>{
        try {
            var categoryId = req.body.categoryId;
            var subCategories = req.body.subCategories;
            if(!Array.isArray(subCategories)){
                return res.status(500).json("Incorrect format for Subcategories. Please Add SubCategories in Arrau=y Format")
            }
            var category = await Category.findOne({_id: categoryId});
            if(!category){
                return res.status(561).json("category Not Found");
            }
            
            try {
                var subCategoriesArray = [];
                subCategories.forEach((subCategory) => {
                    subCategoriesArray.push({
                        "name": subCategory.name,
                        "image": subCategory.image!=undefined?subCategory.image:null
                    })
                });

                var inserted = await Category.updateOne({
                    _id: categoryId
                },{subcategories: subCategoriesArray}); 
                if(inserted){
                    console.log(inserted);
                    return res.status(200).json({
                        "success": true,
                        "SubCategories inserted": true
                    })
                }
                else{
                    return res.status(500).json({
                        "message": "DB error"
                    })
                }
            } catch (error) {
                console.log("Error : ", error);
                res.status(500).json(error);
            }
            
        } catch (error) {
            return res.status(500).json(error);
        }
        
    });
module.exports = router;