var express = require('express');
var router = express.Router();
const multer = require('multer')
const store = require('./middlewares/multer')

const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const adminMiddlewares = require('../routes/middlewares/admin-middlewares')

//GET Admin login
router.get("/login", adminController.getAdminLogin)

//admin post login
router.post('/login', adminController.postAdminLogin)


//admin logout
router.get('/logout', adminController.getLogout)


/* GET dashboard. */
router.get('/', adminMiddlewares.verifyAdminLogin, adminController.getAdminDashboard);

/************************************* */
//             PRODUCTS
/************************************* */
//GET products page
router.get('/products', adminMiddlewares.verifyAdminLogin, adminController.getProducts)

//New product page
router.route('/products/new', adminMiddlewares.verifyAdminLogin)

  .get(adminController.getNewProduct)

  .post(store.array('productImages', 6), adminController.postNewProduct)

//GET edit product
router.get('/products/edit/:productSlug',adminController.getEditProduct)

router.post('/products/edit/:id',store.array('productImages', 6), adminController.postEditProduct)

//GET delete product button
router.get('/products/delete/:productSlug', adminMiddlewares.verifyAdminLogin, adminController.getDeleteProduct)


/************************************* */
//                USERS
/************************************* */
//GET Users 
router.get('/users', adminMiddlewares.verifyAdminLogin, adminController.getUsers)

//GET block user
router.get('/users/block', adminMiddlewares.verifyAdminLogin, adminController.getBlockUser)

//GET unblock user
router.get('/users/unblock', adminMiddlewares.verifyAdminLogin, adminController.getUnblockUser)


/************************************* */
//         PRODUCT CATEGORIES
/************************************* */ 
//GET Categories 
router.get('/product-categories', adminMiddlewares.verifyAdminLogin, adminController.getCategories)

//POST Categories
router.post('/product-categories/new', adminMiddlewares.verifyAdminLogin, adminController.postCategory)

//Delete category 
router.get('/product-categories/delete',
  adminMiddlewares.verifyAdminLogin, adminController.deleteCategory)

//Edit product category page 
router.route('/product-categories/edit', adminMiddlewares.verifyAdminLogin)

  .get(adminController.getEditCategory)

  .post(adminController.putProductCategory)

  
/************************************* */
//         EDIT PRODUCT
/************************************* */ 
router.get('/remove-product-image/:prodId/:imgName', adminMiddlewares.verifyAdminLogin, adminController.deleteProductImage)

module.exports = router;