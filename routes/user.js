var express = require('express');
const { response } = require('../app');
var router = express.Router();
const userController = require('../controller/userController')
const userMiddlewares = require('../routes/middlewares/user-middlewares')


/* GET home page. */
router.get('/', userMiddlewares.verifyUserLogin, userController.getHomepage)

//GET shop page
router.get('/shop', userMiddlewares.verifyUserLogin, userController.getShoppage)

/************************************* */
//             LOGIN
/************************************* */
//Login page 
router.route('/login')
  .get(userController.getLogin)

  .post(userController.postLogin)

//GET logout
router.get('/logout', userController.getLogout)

/************************************* */
//             SIGNUP
/************************************* */
router.route('/signup')
  //GET signup page
  .get(userController.getSignup)

  //POST signup page
  .post(userController.postSignup)

/************************************* */
//             OTP
/************************************* */
router.route('/otp-login')
  .get(userController.getOtpLogin)

  .post(userController.postOtpLogin)

//Verify OTP page
router.route('/verify-otp')
  .get(userController.getVerifyOtp)

  .post(userController.postVerifyOtp,);


/************************************* */
//             PRODUCT PAGE
/************************************* */
//GET single product page
router.get('/product/:productSlug', userMiddlewares.verifyUserLogin, userController.getSingleProduct)


/************************************* */
//                CART
/************************************* */

router.get('/add-to-cart/:id',userController.addToCart)



router.get('/cart',userMiddlewares.verifyUserLogin,userController.getCart)

router.get('/checkout',(req,res)=>{
  res.render('user/checkout')
})



module.exports = router