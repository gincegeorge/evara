var express = require('express');
var router = express.Router();
const store = require('../middlewares/multer')

const adminController = require('../controllers/admin-controller')
const adminMiddlewares = require('../middlewares/admin-middlewares')

//GET Admin login
router.get("/login", adminController.getAdminLogin)

//admin post login
router.post('/login', adminController.postAdminLogin)


//admin logout
router.get('/logout', adminController.getLogout)


/* GET dashboard. */
router.get('/', adminMiddlewares.verifyAdminLogin, adminController.getAdminDashboard);

/************************************* */
//               PRODUCTS
/************************************* */
//GET products page
router.get('/products', adminMiddlewares.verifyAdminLogin, adminController.getProducts)

//New product page
router.route('/products/new')

  .get(adminMiddlewares.verifyAdminLogin, adminController.getNewProduct)

  //TODO product created date
  .post(adminMiddlewares.verifyAdminLogin, store.array('productImages', 6), adminController.postNewProduct)

//GET edit product
router.get('/products/edit/:productSlug', adminMiddlewares.verifyAdminLogin, adminController.getEditProduct)

router.get('/products/edit/remove-product-image/:prodId/:imgName', adminMiddlewares.verifyAdminLogin, adminController.deleteProductImage)

router.post('/products/edit/:id', store.array('productImages', 6), adminMiddlewares.verifyAdminLogin, adminController.postEditProduct)


//GET delete product button
//FIXME DELETE PRODUCT FROM CART ASWELL
router.get('/products/delete/:productSlug', adminMiddlewares.verifyAdminLogin, adminController.getDeleteProduct)


/************************************* */
//               USERS
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
router.route('/product-categories/edit')

  .get(adminMiddlewares.verifyAdminLogin, adminController.getEditCategory)

  .post(adminMiddlewares.verifyAdminLogin, adminController.putProductCategory)


/************************************* */
//                ORDERS
/************************************* */
router.get('/orders', adminMiddlewares.verifyAdminLogin, adminController.getOrders)

router.get('/order/:id', adminMiddlewares.verifyAdminLogin, adminController.viewOrder)

router.patch('/order/change-status', adminMiddlewares.verifyAdminLogin, adminController.OrderStatus)

router.patch('/order/cancel', adminMiddlewares.verifyAdminLogin, adminController.cancelOrder)

router.patch('/order/cancel-cod', adminMiddlewares.verifyAdminLogin, adminController.cancelCodOrder)


/************************************* */
//               SALES
/************************************* */
router.get('/sales-report/new', adminMiddlewares.verifyAdminLogin, adminController.generateReport)

router.post('/sales-report/daily', adminMiddlewares.verifyAdminLogin, adminController.dailyReport)

router.post('/sales-report/monthly', adminMiddlewares.verifyAdminLogin, adminController.monthlyReport)

router.post('/sales-report/yearly', adminMiddlewares.verifyAdminLogin, adminController.yearlyReport)


/************************************* */
//              COUPONS
/************************************* */
router.get('/coupons', adminMiddlewares.verifyAdminLogin, adminController.getCoupons)

router.route('/coupons/new')

  .get(adminMiddlewares.verifyAdminLogin, adminController.newCoupon)

  .post(adminMiddlewares.verifyAdminLogin, adminController.postNewCoupon)

router.route('/coupons/edit')

  .get(adminMiddlewares.verifyAdminLogin, adminController.editCoupon)

  .post(adminMiddlewares.verifyAdminLogin, adminController.postEditCoupon)

  router.get('/coupons/delete', adminMiddlewares.verifyAdminLogin, adminController.deleteCoupon)

module.exports = router;