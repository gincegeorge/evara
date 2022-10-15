var express = require('express');
var router = express.Router();

const adminController = require('../controller/adminController')
const userController = require('../controller/userController')

//Verify admin login status
const verifyAdminLogin =(req,res,next)=>{ 
  if(req.session.adminData){
    next() 
  }else{
    res.redirect('/admin/login')
  }
}

//GET Admin login
router.get("/login", adminController.getAdminLogin)

//admin post login
router.post('/login',adminController.postAdminLogin)  

//admin logout
router.get('/logout',adminController.getLogout)

/* GET dashboard. */
router.get('/', verifyAdminLogin,adminController.getAdminDashboard);

//GET products page
router.get('/products',verifyAdminLogin, adminController.getProducts)

//GET add product
router.get('/new-product', verifyAdminLogin,adminController.getNewProduct)

//POST new product
router.post('/new-product', verifyAdminLogin,adminController.postNewProduct)

//GET edit product
router.get('/edit-product', verifyAdminLogin,adminController.getEditProduct)

//POST edit product
router.post('/edit-product', verifyAdminLogin,adminController.postEditProduct)

//GET delete product button
router.get('/delete-product/', verifyAdminLogin,adminController.getDeleteProduct)

//GET Users 
router.get('/users', verifyAdminLogin,adminController.getUsers)

//GET block user
router.get('/block-user',verifyAdminLogin,adminController.getBlockUser)

//GET unblock user
router.get('/unblock-user',verifyAdminLogin,adminController.getUnblockUser)

module.exports = router; 