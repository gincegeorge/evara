var express = require('express');
var router = express.Router();
const multer = require('multer')
const store = require('./middlewares/multer')

const adminController = require('../controller/adminController')
const userController = require('../controller/userController')


//Verify admin login status
const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminData) {
    next()
  } else { 
    res.redirect('/admin/login')
  }
}

//GET Admin login
router.get("/login", adminController.getAdminLogin)

//admin post login
router.post('/login', adminController.postAdminLogin)

//admin logout
router.get('/logout', adminController.getLogout)
 
/* GET dashboard. */
router.get('/', adminController.getAdminDashboard); 

//GET products page
router.get('/products',  adminController.getProducts)

//GET add product
router.get('/new-product', store.array('productImages', 6), adminController.getNewProduct)

//POST new product
router.post('/new-product', store.array('productImages', 6), adminController.postNewProduct)

//GET edit product
router.get('/edit-product',  adminController.getEditProduct)

//POST edit product
router.post('/edit-product',  adminController.postEditProduct)

//GET delete product button
router.get('/delete-product/', adminController.getDeleteProduct)

//GET Users 
router.get('/users', adminController.getUsers)

//GET block user
router.get('/block-user',adminController.getBlockUser)

//GET unblock user
router.get('/unblock-user', adminController.getUnblockUser)

//GET Categories 
router.get('/product-categories', adminController.getCategories)

//POST Categories
router.post('/add-category',adminController.postCategory)

//Delete category 
router.get('/delete-product-category', adminController.deleteCategory)

//Get edit category
router.get('/edit-product-category', adminController.getEditCategory)

module.exports = router;  