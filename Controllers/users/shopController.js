const Product = require('../../Models/productModel');
const Category = require('../../Models/categoryModel');
const Brand = require('../../Models/brandModel');


const loadShop = async(req,res)=>{

    try{

        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        const products = await Product.find({isBlocked:false}).skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        const categories = await Category.find({isListed:true});
        const brands = await Brand.find({isBlocked:false});

        
        res.render('users/shop', {
            products: products,
            categories: categories,
            brands: brands,
            currentPage: 'shop',
            totalPages: totalPages,
            limit: limit,

        });
    }
    catch(error){
        console.log('Error while loading shop:', error);
        res.redirect('/pageError');
    }
}



module.exports = {
    loadShop
}