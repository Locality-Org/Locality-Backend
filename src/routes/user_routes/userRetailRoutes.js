const router = require('../../../server').router;
const user_auth = require('../../user_route_implementation/user_auth');
const userRetailRouteImplementation = require('../../user_route_implementation/userRetailRouteImplementation');

router.route('/getCategory/:catId')
    .all(user_auth.verifyFBTokenMiddleWare)
    .get(async (req, res) => {
        userRetailRouteImplementation.getCategory(req,res);
    });

router.route('/getSubCategory/:catId')
    .all(user_auth.verifyFBTokenMiddleWare)
    .get(async (req, res) => {
        userRetailRouteImplementation.getSubCategory(req,res);
    });

router.route('/getShop/:shopId')
    .all(user_auth.verifyFBTokenMiddleWare)
    .get(async (req, res) => {
        userRetailRouteImplementation.getShop(req, res);
    });

router.route('/getProductDetails/:prodId')
    .all(user_auth.verifyFBTokenMiddleWare)
    .get(async (req, res) => {
        userRetailRouteImplementation.getProductDetails(req,res);
    });

module.exports = router;

