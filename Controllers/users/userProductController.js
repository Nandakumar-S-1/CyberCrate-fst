const Product = require('../../Models/productModel');
const Category = require('../../Models/categoryModel');
const User = require('../../Models/userModel');

const productDetails = async (req, res) => {
    try {
        console.log('pro');
        
        const userId = req.session.user;
        const userData = userId ? await User.findById(userId) : null;
        const productId = req.params.id
        console.log("productId",productId);
        
        const product = await Product.findById(productId).populate('category');
        const findCategory = product.category;
        if (!product) {
            return res.status(404).render('404-error',{message:'Product not found'});
        }

        const relatedProducts = await Product.find({
            category: product.category,
            _id:{
                $ne:productId
            },
        }).limit(3)

        res.render('users/productDetails', {
            user: userData,
            product: product,
            category: findCategory,
            quantity:product.quantity,
            relatedProducts
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    productDetails
};



