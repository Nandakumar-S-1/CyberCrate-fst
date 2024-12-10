const express = require('express');
const router = express.Router();
const {isAdminAuthenticated} = require('../Middleware/adminAuth')
const adminController = require('../Controllers/admin/adminController');
const customerController = require('../Controllers/admin/customerController');
const categoryController=require('../Controllers/admin/categoryController')
const brandController=require('../Controllers/admin/brandController')
const productController=require('../Controllers/admin/productController')

const upload = require('../Helpers/multer');


// admin authentication routes
router.get('/pageError',adminController.pageError)
router.get('/login', adminController.loadAdminLogin);
router.post('/login', adminController.verifyLogin);
router.get('/logout',adminController.logout)

// adminpanel routes
router.get('/dashboard', isAdminAuthenticated, adminController.loadDashboard);
// userManagement Routes
router.get('/users', isAdminAuthenticated, customerController.loadUsers);
router.get('/blockCustomer', isAdminAuthenticated, customerController.blockCustomer);
router.get('/unBlockCustomer', isAdminAuthenticated, customerController.unBlockCustomer);

// categoryManagemanet routes
router.get('/categories',isAdminAuthenticated,categoryController.loadCategories);
router.post('/categories',isAdminAuthenticated,categoryController.addNewCategories)
router.get('/listCategories',isAdminAuthenticated,categoryController.listCategories);
router.get('/unListCategories',isAdminAuthenticated,categoryController.unListCategories);
router.get('/editCategory',isAdminAuthenticated,categoryController.editCategory);
router.post('/editCategory',isAdminAuthenticated,categoryController.updateCategory);

// brandManagemanet routes
router.get('/brands',isAdminAuthenticated,brandController.loadBrands);
router.post('/brands',isAdminAuthenticated,upload.single('image'),brandController.addNewBrand);
router.get('/blockBrand',isAdminAuthenticated,brandController.blockBrand);
router.get('/unBlockBrand',isAdminAuthenticated,brandController.unBlockBrand);
router.get('/deleteBrand',isAdminAuthenticated,brandController.deleteBrand);
router.get('/restoreBrand', isAdminAuthenticated, brandController.restoreBrand); 


//productManagement routes
router.get('/products',isAdminAuthenticated,productController.loadProducts);
router.get('/addProducts',isAdminAuthenticated,productController.loadAddProduct);
router.post('/addProducts',isAdminAuthenticated,upload.array('image'),productController.addNewProduct);

module.exports = router;