const Product = require("../../Models/productModel");
const Category = require("../../Models/categoryModel");
const Brand = require("../../Models/brandModel");
const User = require("../../Models/userModel");

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const loadProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        const productData = await Product.find()
                                        .sort({ createdAt: -1 })
                                        .skip(skip)
                                        .limit(limit);

        const mappedProductData = productData.map((product) => ({
            _id: product._id,
            productName: product.productName,
            description: product.description,
            brand: product.brand,
            category: product.category,
            realPrice: product.realPrice,
            salePrice: product.salePrice,
            productImage: product.productImage,
            quantity: product.quantity,
            status: product.status
        }));

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('admin/products', {
            products: mappedProductData,
            currentPage: page,
            totalPages: totalPages,
            totalProducts: totalProducts
        });
    } catch (error) {
        console.error("Error loading products:", error);
        res.redirect("/pageError");
    }
};


const loadAddProduct = async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true });
    const brands = await Brand.find({ isBlocked: false });
    console.log("Fetched brands:", brands);
    res.render("admin/addProducts", { category: categories, brand: brands });
  } catch (error) {
    console.error("Error loading add product page:", error);
    res.redirect("/pageError");
  }
};

const addNewProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      brand,
      category,
      quantity,
      regularPrice,
      salePrice,
      productOffer,
      status,
    } = req.body;
    const productExist = await Product.findOne({ productName });
    if (!productExist) {
      const images = [];
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const originalImagePath = req.files[i].path;
          const resizedImagePath = path.join(
            "public",
            "img",
            "products",
            req.files[i].filename
          );
          await sharp(originalImagePath)
            .resize({ width: 450, height: 450, fit: "contain" })
            .toFile(resizedImagePath);
          images.push(req.files[i].filename);
        }
      }
      const categoryId = await Category.findOne({ name: category });
      if (!categoryId) {
        return res.status(404).json({ error: "Category not found" });
      }
      const newProduct = new Product({
        productName,
        description,
        brand,
        category: categoryId._id,
        realPrice: regularPrice,
        salePrice,
        productOffer,
        quantity,
        productImage: images,
        status,
      });
      const savedProduct = await newProduct.save();
      if (savedProduct) {
        res.redirect("/admin/products");
      } else {
        res.status(500).json({ error: "Failed to save product" });
      }
    } else {
      res
        .status(400)
        .json({ error: "Product already exists, try another one" });
    }
  } catch (error) {
    console.log("Error adding new product:", error);
    res.redirect("/pageError");
  }
};

// const addNewProduct = async (req, res) => {
//     try {
//         const products = req.body;
//         const productExist = await Product.findOne({ name: products.name });

//         if (!productExist) {
//             const images = [];
//             if (req.files && req.files.length > 0) {
//                 for (let i = 0; i < req.files.length; i++) {
//                     const originalImagePath = req.files[i].path;
//                     const resizedImagePath = path.join('public', 'img', 'products', req.files[i].filename);
//                     await sharp(originalImagePath)
//                         .resize({ width: 550, height: 450})
//                         .toFile(resizedImagePath);
//                     images.push(req.files[i].filename);
//                 }
//             }

//             const categoryId = await Category.findOne({ name: products.category });
//             if (!categoryId) {
//                 return res.status(404).json({ error: 'Category not found' });
//             }

//             const newProduct = new Product({
//                 name: products.name,
//                 description: products.description,
//                 brand: products.brand,
//                 category: products.category,
//                 realPrice: products.realPrice,
//                 salePrice: products.salePrice,
//                 productOffer: products.productOffer,
//                 quantity: products.quantity,
//                 productImage: images,
//                 status: products.status
//             });

//             const savedProduct = await newProduct.save();

//             if (savedProduct) {
//                 res.redirect('/admin/products');
//             }
//         } else {
//             res.status(400).json({ error: 'Product already exists, try another one' });
//         }
//     } catch (error) {
//         console.log('Error adding new product:', error);
//         res.redirect('/pageError');
//     }
// }

module.exports = {
  loadAddProduct,
  loadProducts,
  addNewProduct,
};

// const Product = require('../../Models/productModel');
// const Category = require('../../Models/categoryModel');
// const Brand = require('../../Models/brandModel');
// const User = require('../../Models/userModel');

// const fs = require('fs');
// const path = require('path');
// const sharp = require('sharp')

// const loadProducts = async (req, res) => {
//     try {
//         const products = await Product.find(); // Fetch all products from the database
//         res.render('admin/products', {
//             products: products,
//             currentPage: 'products' // Pass currentPage variable to the template
//         });
//     } catch (error) {
//         console.error('Error loading products:', error);
//         res.redirect('/pageError');
//     }
// }

// const loadAddProduct = async (req, res) => {
//     try {

//         const category = await Category.find({ isListed: true });
//         const brand = await Brand.find({ isBlocked: false });

//         console.log('Fetched brands:', brand);
//         res.render('admin/addProducts', { category: category, brand: brand });

//     } catch (error) {
//         console.error('Error loading add product page:', error);
//         res.redirect('/pageError')
//     }

// }

// const addNewProduct = async (req, res) => {
//     try {

//         const products =req.body;
//         const productExist = await Product.findOne({
//             name: products.name
//             });

//         if(!productExist){
//             const images=[];
//             if(req.files && req.files.length > 0){
//                 for (let i = 0; i < req.files.length; i++) {
//                     const originalImagePath = req.files[i].path;
//                     const resizedImagePath   = path.join('public','img','products',req.files[i].filename);
//                     await sharp(originalImagePath)
//                         .resize({ width: 450, height: 450, fit: 'contain' })
//                         .toFile(resizedImagePath);
//                     images.push(req.files[i].filename);
//                 }
//             }

//             const categoryId = await Category.findOne({ name: products.category });
//             if(!categoryId){
//                 return res.status(404).json({ error: 'Category not found' });
//             }

//             const newProduct = new Product({
//                 name: products.name,
//                 category: products.category,
//                 brand: products.brand,
//                 description: products.description,
//                 realPrice: products.realPrice,
//                 salePrice: products.salePrice,
//                 productOffer: products.productOffer,
//                 quantity: products.quantity,
//                 productImage: images,
//                 status: products.status
//             });

//             const savedProduct = await newProduct.save();

//             if (savedProduct) {
//                 res.redirect('/admin/products');
//             }
//         }else{
//             res.status(400).json({ error: 'Product already exists, try anothert one' });
//         }

//     } catch (error) {
//         console.log('Error adding new product:', error);
//         res.redirect('/pageError')

//     }
// }

// module.exports = {
//     loadAddProduct,
//     loadProducts,
//     addNewProduct
// }
