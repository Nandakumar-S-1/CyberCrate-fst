const category = require('../../Models/categoryModel');

const loadCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        
        const categories = await category.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCategories = await category.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);
        
        res.render('admin/categories', {
            categories: categories,
            currentPage: 'categories',
            page: page,
            totalPages: totalPages,
            limit: limit,
            layout: 'layouts/admin/layout'
        });

    } catch (error) {
        console.log('Error while loading categories:', error);
        res.redirect('/pageError');
    }
}

const addNewCategories = async(req,res)=>{
    const {name,description}=req.body;

    try {
        
        const categoryExist= await category.findOne({name});
        if(categoryExist){
            return res.status(400).json({error:'Category Already Exists'});
        }

        const newCategory= new category({
            name,
            description
        })

        await newCategory.save();
        // return res.json({message:"Category added successfully"})

    } catch (error) {
        return res.status(500).json({error:'Internal Server Error'})
    }
} 

const listCategories = async(req,res)=>{
    try {
        
        const id=req.query.id;
        await category.updateOne({_id:id},{$set:{isListed:false}})
        res.redirect('/admin/categories')

    } catch (error) {
        
        console.log(error);
        
        res.redirect('/pageError')

    }
}

const unListCategories = async(req,res)=>{
    try {
        
        const id=req.query.id;
        await category.updateOne({_id:id},{$set:{isListed:true}})
        res.redirect('/admin/categories')

    } catch (error) {
        console.log(error);
        res.redirect('/pageError')
        
    }
}

const editCategory = async(req,res)=>{
    try {
        
    const id=req.query.id;
    const category=await category.findOne({_id:id})
    res.render('admin/editCategory',{category:category});    

    } catch (error) {
        
        console.log('error while editing the categories',error);
        
        res.redirect('/pageError')
        
    }
}

const updateCategory = async(req,res)=>{
    try {
        
        const id=req.params.id;
        const {name,description}=req.body;
        const existingCategory=await category.findOne({_id:id});
        if(existingCategory){
            return res.status(400).json({error:'Category Already Exists,write another One'});
        }
        const updateCategory=await category.findByIdAndUpdate(id,{
            name:name,
            description:description
        },{new:true});

        if(updateCategory){
            res.redirect('/admin/categories')
            return res.status(200).json({message:'Category Updated Successfully'})
        }else{
            return res.status(404).json({error:'Category Not Found'})
        }
        
    } catch (error) {

        console.log('Error while updating category',error);
        return res.status(500).json({error:'Internal Server Error'})    

    }
}

module.exports={
    loadCategories ,
    addNewCategories,
    listCategories,
    unListCategories,
    editCategory,
    updateCategory
}