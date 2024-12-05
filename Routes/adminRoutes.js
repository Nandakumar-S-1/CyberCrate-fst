const express=require('express');
const router = express.Router();
const adminController=require('../Controllers/admin/adminController')



router.get('/',adminController.loadAdminHome);



module.exports = router;