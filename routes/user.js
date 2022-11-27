/* eslint-disable linebreak-style */
const express = require('express');

const router = express.Router();
const userController = require('../controllers/user-controller');
const userMiddlewares = require('../middlewares/user-middlewares');

/** *********************************** */
//              SEARCH
/** *********************************** */
router.post('/search', userController.searchResults);
/** *********************************** */
//              HOMEPAGE
/** *********************************** */
router.get('/', userMiddlewares.accessWithoutLogin, userController.getHomepage);

/** *********************************** */
//              LOGIN
/** *********************************** */
router.route('/login')

  .get(userController.getLogin)

  .post(userController.postLogin);

router.get('/logout', userController.getLogout);

/** *********************************** */
//             SIGNUP
/** *********************************** */
router.route('/signup')

  .get(userController.getSignup)

  .post(userController.postSignup);

/** *********************************** */
//             OTP
/** *********************************** */
router.route('/otp-login')

  .get(userController.getOtpLogin)

  .post(userController.postOtpLogin);

router.route('/verify-otp')

  .get(userController.getVerifyOtp)

  .post(userController.postVerifyOtp);

/** *********************************** */
//            SHOP PAGES
/** *********************************** */
router.get('/shop', userMiddlewares.accessWithoutLogin, userController.getShoppage);

router.get('/product/:productSlug', userMiddlewares.accessWithoutLogin, userController.getSingleProduct);

router.get('/categories/:categorySlug', userMiddlewares.accessWithoutLogin, userController.getCategoryPage);

/** *********************************** */
//                CART
/** *********************************** */
router.get('/add-to-cart/:id', userMiddlewares.verifyUserLogin, userController.addToCart);

router.get('/cart', userMiddlewares.verifyUserLogin, userController.getCart);

router.post('/change-product-quantity', userMiddlewares.verifyUserLogin, userController.changeProductQuantity);

router.post('/delete-product-from-cart', userMiddlewares.verifyUserLogin, userController.deleteProductFromCart);

/** *********************************** */
//                WISHLIST
/** *********************************** */
router.get('/wishlist/add-product/:id', userMiddlewares.verifyUserLogin, userController.addToWishlist);

router.get('/wishlist', userMiddlewares.verifyUserLogin, userController.getWishlist);

router.delete('/wishlist/remove-product', userMiddlewares.verifyUserLogin, userController.deleteProductFromWishlist);

router.patch('/wishlist/addtocart', userMiddlewares.verifyUserLogin, userController.addToCartFromWishlist);

/** *********************************** */
//              CHECKOUT
/** *********************************** */
router.get('/checkout', userMiddlewares.verifyUserLogin, userController.getCheckout);

// APPLY COUPON
router.post('/checkout/apply-coupon', userMiddlewares.verifyUserLogin, userController.applyCoupon);

// REMOVE COUPON
router.get('/checkout/remove-coupon/:id', userMiddlewares.verifyUserLogin, userController.removeCoupon);

// PLACE ORDER
router.post('/place-order', userMiddlewares.verifyUserLogin, userController.getPlaceOrder);

// RAZORPAY VERIFICATION
router.post('/verify-payment', userMiddlewares.verifyUserLogin, userController.verifyPayment);

// PAYPAL
router.get('/success', userController.verifyPaypal);

router.get('/cancel', (req, res) => res.redirect('/checkout'));

// ORDER PLACED PAGE
router.get('/order-placed', userMiddlewares.verifyUserLogin, userController.orderPlaced);

/** *********************************** */
//              MY ACCOUNT
/** *********************************** */
router.get('/my-account', userMiddlewares.verifyUserLogin, userController.myAccount);

router.get('/my-account/address', userMiddlewares.verifyUserLogin, userController.myAddress);

router.post('/my-account/address/new', userMiddlewares.verifyUserLogin, userController.addNewAddres);

router.post('/my-account/address/edit', userMiddlewares.verifyUserLogin, userController.editAddres);

router.delete('/my-account/address/delete', userMiddlewares.verifyUserLogin, userController.deleteAddress);

/** *********************************** */
//              MY ORDERS
/** *********************************** */
router.get('/my-account/orders', userMiddlewares.verifyUserLogin, userController.myOrders);

router.get('/my-account/order/:id', userMiddlewares.verifyUserLogin, userController.viewOrder);

// ONLINE PAYMENT
router.patch('/my-account/order/cancel', userController.cancelOrder);

router.patch('/my-account/order/return', userMiddlewares.verifyUserLogin, userController.returnOrder);

// COD
router.patch('/my-account/order/cancel-cod', userMiddlewares.verifyUserLogin, userController.cancelCodOrder);

router.patch('/my-account/order/return-cod', userMiddlewares.verifyUserLogin, userController.returnCodOrder);

module.exports = router;
