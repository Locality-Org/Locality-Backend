const router = require('../../../server').router;
const Category = require('../../../models/Category_Model');
const Ad = require('../../../models/Ad_Model');
const Shop = require('../../../models/Shop_Model');
const Product = require('../../../models/Product_Model');
const User = require('../../../models/User_Model');
const { getDecodedJwt } = require('../../../src/user_route_implementation/user_auth');

router.route('/get_category/:catId').get(async (req, res) => {
	try {
		const _category = await Category.findById(req.params.catId).populate('subcategories');
		if (!_category) {
			return res.status(404).json({
				message: 'No category was found!',
			});
		}
		const _ads = await Ad.find({
			$and: [
				{
					section: 'Category',
				},
				{
					parent: _category._id,
				},
			],
		});
		const _response = {
			trending_subcategories: [], // TODO: Implement logic
			subcategories: _category.subcategories.map((_cat) => ({
				id: _cat._id,
				name: _cat.name,
				image: _cat.image,
			})),

			popular_products: [], // TODO: Implement logic
			popular_stores: [], // TODO: Implement logic
			ads: _ads.map((_ad) => ({ media: _ad.media })),
		};
		return res.status(200).json(_response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: error,
		});
	}
});

router.route('/get_subCategory/:catId').get(async (req, res) => {
	try {
		const _subcategory = await Category.exists({ id: req.params.catId });
		if (!_subcategory) {
			return res.status(404).json({
				message: 'No subcategory was found!',
			});
		}
		const _ads = await Ad.find({
			$and: [
				{
					section: 'Category',
				},
				{
					parent: req.params.catId,
				},
			],
		});
		const _response = {
			// TODO: Implement after shop and store API is complete
			popular_products: [],
			products: [],
			ads: _ads.map((_ad) => ({ media: _ad.media })),
		};
		return res.status(200).json(_response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: error,
		});
	}
});

router.route('/get_shop/:shopId').get(async (req, res) => {
	try {
		const _shop = await Shop.findById(req.params.shopId).populate('address');
		if (!_shop) {
			return res.status(404).json({
				message: 'No shop was found!',
			});
		}
		const _products = Product.find({ seller: _shop._id });
		const _ads = Ad.find({
			$and: [
				{
					section: 'Shop',
				},
				{
					parent: _shop._id,
				},
			],
		});
		await Promise.all([_products, _ads]);

		const _response = {
			shop_details: {
				mob: _shop.mobile,
				instagram: _shop.instagram,
				facebook: _shop.facebook,
				website: _shop.website,
				name: _shop.name,
				address: _shop.address,
				location: _shop.location,
			},
			popular_products: [], // TODO: Implement logic
			products: _products.map((_item) => ({
				id: _item._id,
				name: _item.name,
				image: _item.image,
				ratings: _item.ratings,
				discount: _item.discount,
				price: _item.price,
				seller: {
					id: _shop._id,
					name: _shop.name,
					location: _shop.location,
					ratings: _shop.ratings,
				},
			})),
			ads: _ads.map((_ad) => ({ media: _ad.media })),
		};
		return res.status(200).json(_response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: error,
		});
	}
});

router.route('/get_product_details/:prodId').get(async (req, res) => {
	try {
		const _product = await Product.findById(req.params.prodId)
			.populate('seller', '_id name location ratings address')
			.populate('reviews')
			.populate('discount_coupons');
		if (!_product) {
			return res.status(404).json({
				message: 'No product found!',
			});
		}

		const _decoded = getDecodedJwt(req);
		const _user = _decoded ? User.findById(_decoded._id) : Promise.resolve();

		const _ads = Ad.find({
			$and: [
				{
					section: 'Product',
				},
				{
					parent: _product._id,
				},
			],
		});

		await Promise.all([_user, _ads]);

		const _response = {
			seller: {
				id: _product.seller._id,
				name: _product.seller.name,
				location: _product.seller.location,
				ratings: _product.seller.ratings,
				address: _product.seller.address,
			},
			id: _product._id,
			name: _product.name,
			image: _product.image,
			ratings: _product.ratings,
			reviews: _product.reviews.map((_item) => ({
				user_name: _item.user_name,
				description: _item.description,
				medias: _item.media,
			})),
			discount: _product.discount,
			price: _product.price,
			discount_coupons: _product.discount_coupons.map((_item) => ({
				id: _item._id,
				discount_percentage: _item.discount_percentage,
				max_discount_rs: _item.max_discount_rs,
				min_order_value: _item.min_order_value,
				code: _item.code,
			})),
			size: _product.size,
			variations: _product.variations,
			in_cart: _user?.cart?.includes(_product._id) ? true : false,
			description_list: _product.description_list,
			ads: _ads.map((_ad) => ({ media: _ad.media })),
		};
		return res.status(200).json(_response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: error,
		});
	}
});
