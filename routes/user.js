var express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');
const userMiddlewares = require('../middlewares/user-middlewares')

/* GET home page. */
router.get('/', userMiddlewares.verifyUserLogin, userController.getHomepage)

/************************************* */
//              LOGIN
/************************************* */
router.route('/login')

  .get(userController.getLogin)

  .post(userController.postLogin)


router.get('/logout', userController.getLogout)

/************************************* */
//             SIGNUP
/************************************* */
router.route('/signup')

  .get(userController.getSignup)

  .post(userController.postSignup)

/************************************* */
//             OTP
/************************************* */
router.route('/otp-login')

  .get(userController.getOtpLogin)

  .post(userController.postOtpLogin)


router.route('/verify-otp')

  .get(userController.getVerifyOtp)

  .post(userController.postVerifyOtp,);

/************************************* */
//            SHOP PAGES
/************************************* */
router.get('/shop', userMiddlewares.verifyUserLogin, userController.getShoppage)

router.get('/product/:productSlug', userMiddlewares.verifyUserLogin, userController.getSingleProduct)

/************************************* */
//                CART
/************************************* */
router.get('/add-to-cart/:id', userMiddlewares.verifyUserLogin, userController.addToCart)

router.get('/cart', userMiddlewares.verifyUserLogin, userController.getCart)

router.post('/change-product-quantity', userMiddlewares.verifyUserLogin, userController.changeProductQuantity)

router.post('/delete-product-from-cart', userMiddlewares.verifyUserLogin, userController.deleteProductFromCart)

/************************************* */
//              CHECKOUT
/************************************* */
router.get('/checkout', userMiddlewares.verifyUserLogin, userController.getCheckout)

//PLACE ORDER
router.post('/place-order', userMiddlewares.verifyUserLogin, userController.getPlaceOrder)

//RAZORPAY VERIFICATION
router.post('/verify-payment', userMiddlewares.verifyUserLogin, userController.verifyPayment)

//PAYPAL
router.get('/success', userController.verifyPaypal);
router.get('/cancel', (req, res) => res.redirect('/checkout'));

//ORDER PLACED PAGE
router.get('/order-placed', userMiddlewares.verifyUserLogin, userController.orderPlaced)


/************************************* */
//              MY ACCOUNT
/************************************* */

router.get('/my-account', userMiddlewares.verifyUserLogin, userController.myAccount)

router.get('/my-account/address', userMiddlewares.verifyUserLogin, userController.myAddress)

router.post('/my-account/address/new', userMiddlewares.verifyUserLogin, userController.addNewAddres)

router.delete('/my-account/address/delete', userMiddlewares.verifyUserLogin, userController.deleteAddress)


/************************************* */
//              MY ORDERS
/************************************* */
router.get('/my-account/orders', userMiddlewares.verifyUserLogin, userController.myOrders)

router.get('/my-account/order/:id', userMiddlewares.verifyUserLogin, userController.viewOrder)


router.patch('/my-account/order/cancel', userMiddlewares.verifyUserLogin, userController.cancelOrder)

router.patch('/my-account/order/return', userMiddlewares.verifyUserLogin, userController.returnOrder)

 
//COD
router.patch('/my-account/order/cancel-cod', userMiddlewares.verifyUserLogin, userController.cancelCodOrder)

router.patch('/my-account/order/return-cod', userMiddlewares.verifyUserLogin, userController.returnCodOrder)


// paypal
// router.post('/pay', async(req,res)=>{
//   await paypal_o.paypal_helper("kkkk", "kkkkkk", "kkkk", res, router)
// });

module.exports = router