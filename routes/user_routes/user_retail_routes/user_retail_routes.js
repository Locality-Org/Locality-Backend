const router = require('../../../server').router;
const Category = require('../../../models/Category_Model');
const Ad = require('../../../models/Ad_Model');

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
			trending_subcategories: [],
			subcategories: _category.subcategories.map((_cat) => ({
				id: _cat._id,
				name: _cat.name,
				image: _cat.image,
			})),

			// TODO: Implement after shop and store API is complete
			popular_products: [],
			popular_stores: [],
			ads: _ads.map((_ad) => ({ media: _ad.media })),
		};
		return res.status(200).json(_response);
	} catch (error) {}
});
