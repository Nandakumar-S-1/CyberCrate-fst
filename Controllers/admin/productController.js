const Product = require("../../Models/productModel");
const Category = require("../../Models/categoryModel");
const Brand = require("../../Models/brandModel");
const User = require("../../Models/userModel");

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const loadProducts = async (req, res) => {
  try {
      const search = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = 6;
      const skip = (page - 1) * limit;

      const categories = await Category.find({ name: { $regex: new RegExp(".*" + search + ".*", "i") } });
      const brands = await Brand.find({ name: { $regex: new RegExp(".*" + search + ".*", "i") } });

      const categoryIds = categories.map(category => category._id);
      const brandIds = brands.map(brand => brand._id);

      const productData = await Product.find({
          $or: [
              { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
              { brand: { $in: brandIds } },
              { category: { $in: categoryIds } },
              { description: { $regex: new RegExp(".*" + search + ".*", "i") } }
          ]
      })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("category")
          .populate("brand")
          .exec();

      const count = await Product.countDocuments({
          $or: [
              { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
              { brand: { $in: brandIds } },
              { category: { $in: categoryIds } },
              { description: { $regex: new RegExp(".*" + search + ".*", "i") } }
          ]
      });

      const category = await Category.find({ isListed: true });
      const brand = await Brand.find({ isBlocked: false });

      if (category.length > 0 && brand.length > 0) {
          res.render("admin/products", {
              products: productData, 
              currentPage: page,
              totalPages: Math.ceil(count / limit),
              totalProducts: count,
              category: category,
              brand: brand,
              search: search
          });
      } else {
          res.render('404-error');
      }

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

const blockProduct = async(req,res)=>{
  try {
    
    const productId = req.params.id;
    await Product.updateOne({_id:productId},{$set:{isBlocked:true}})
    res.status(200).send({ message: 'Product blocked successfully' });
  } catch (error) {
    
    console.log('error while blocking product',error);
    res.status(500).send('Error while blocking product');
  }

}

const unBlockProduct = async(req,res)=>{
  
  try {
    
    const productId = req.params.id;
    await Product.updateOne({_id:productId},{$set:{isBlocked:false}})
    res.status(200).send({ message: 'Product unblocked successfully' });
  } catch (error) {
    console.log('error while unblocking product',error);
    res.status(500).send('Error while unblocking product');
  }

}

const loadEditProduct = async (req,res)=>{
  try {
    
    const productId = req.params.id;
    const product = await Product.findById(productId);
    const category = await Category.find({isListed:true});
    const brand = await Brand.find({isBlocked:false});

    if(product&& !product.images){
      product.images = [];
    }

    res.render('admin/editProduct',{
      product:product,
      category:category,
      brand:brand
    });



  } catch (error) {
    console.log('Error while loading edit product',error);
    res.redirect('/pageError')
    
  }
}

const editProduct = async(req,res)=>{
  try {
    
    const productId = req.params.id;
    const productData = req.body;
    const product = await Product.findOne({_id:productId})
    const existingProduct = await Product.findOne({ 
      productName: productData.productName,
      _id:{$ne:productId}
    });

    if(existingProduct){
      return res.status(400).json({error:'Product already exists'})
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      for(let i=0;i<req.files;i++){
        images.push(req.files[i].filename);
      }
    }
    const updateFields = {
      productName:productData.productName,
      description:productData.description,
      brand:productData.brand,
      category:productData.category,
      realPrice:productData.regularPrice,
      salePrice:productData.salePrice,
      productOffer:productData.productOffer,
      quantity:productData.quantity,
      status:productData.status
    
    }
    if(req.files&&req.files.length>0){
      updateFields.$push={
        productImage:{$each:images}
      }
    }
    await Product.findByIdAndUpdate(productId,{ $set : updateFields },{ new:true })
    res.redirect('/admin/products');

  } catch (error) {
    console.log('error while editing product',error);
    res.redirect('/pageError')
    
  }
}


const deleteSingleImage = async(req,res)=>{
  try {
    const {imageName,productId}=req.body;

    await Product.findByIdAndUpdate(productId,{
      $pull:{productImage:imageName}
    });

    const imagePath= path.join('public','img','products',imageName);
    if(fs.existsSync(imagePath)){
      await fs.unlinkSync(imagePath);
      console.log(`image ${imageName} has beendeleted successfully`);
      
    }else{
      console.log(`image ${imageName} not found`);
      
    }

    res.send({status:true});
  } catch (error) {
    
    console.log('error while deleting image',error);
    res.redirect('/pageError')

  }
}

const updateProduct = async(req,res)=>{
 try {
  const productId = req.query.id;
  const product = await Product.findById(productId);
  const productData = req.body;
  const category = await Category.find({isListed:true});
  const brand = await Brand.find({isBlocked:false});

  const images = [];
  if(product){
    product.productImage = [];
    await product.save();
  }
  
  if (req.files && req.files.length > 0) {
    for(let i=0;i<req.files.length;i++){
      images.push(req.files[i].filename);
    }
  }

  const updateFields = {
    productName:productData.productName,
    description:productData.description,
    brand:productData.brand,
    category:productData.category,
    realPrice:productData.regularPrice,
    salePrice:productData.salePrice,
    quantity:productData.quantity,
    status:productData.status
    
  }
  if(req.files&&req.files.length>0){
    updateFields.$push={
      productImage:{$each:images}
    }
  }
  const updatedProduct = await Product.findByIdAndUpdate(productId,{ $set : updateFields },{ new:true })

  res.render('admin/editProduct')

 } catch (error) {
  res.redirect('/pageError')
 } 
}

module.exports = {
  loadAddProduct,
  loadProducts,
  addNewProduct,
  blockProduct,
  unBlockProduct,
  loadEditProduct,
  editProduct,
  deleteSingleImage
}
