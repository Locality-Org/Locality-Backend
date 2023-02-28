const router = require('../../../server').router;
const user_auth = require('../../vendor_route_implementation/vendor_auth');
const userRetailRouteImplementation = require('../../vendor_route_implementation/vendorRetailRouteImplementation');

router.route('/getCategory/:catId')
    .all(user_auth.verifyFBTokenMiddleWare)
    .get(async (req, res) => {
        userRetailRouteImplementation.getCategory(req, res);
    });

router.route('/getSubCategory/:catId')
    .all(user_auth.verifyFBTokenMiddleWare)
    .get(async (req, res) => {
        userRetailRouteImplementation.getSubCategory(req, res);
    });

//TODO: remove this route
router.route('/getShop/:shopId')
    .all(user_auth.verifyFBTokenMiddleWare)
    .get(async (req, res) => {
        userRetailRouteImplementation.getShop(req, res);
    });

router.route('/getProductDetails/:prodId')
    .all(user_auth.verifyFBTokenMiddleWare)
    .get(async (req, res) => {
        userRetailRouteImplementation.getProductDetails(req, res);
    });

//posting item for sale
router.route('/addProduct')
    .all(user_auth.verifyFBTokenMiddleWare)
    .get((req, res) => {
        return res.json("addProduct Page GET Request");
    })
    .post(async (req, res) => {
        userRetailRouteImplementation.addProduct(req, res);
    });

module.exports = router;

