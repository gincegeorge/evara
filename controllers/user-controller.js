const userHelpers = require('../helpers/user-helpers')
const productHelpers = require('../helpers/product-helpers')
const cartHelpers = require('../helpers/cart-helpers')
const orderHelpers = require('../helpers/order-helpers')
const wishlistHelpers = require('../helpers/wishlist-helpers')
const paypal = require('paypal-rest-sdk')
const { userDebug, adminDebug, debugDb } = require('../helpers/debug')
const { response } = require('../app')


//PAYPAL PAYMENT
paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
})

//HOMEPAGE
const getHomepage = async (req, res, next) => {
    productHelpers.getAllProducts().then((products) => {
        res.render('user/index', { products })
    })
}

//LOGIN PAGE
const getLogin = (req, res) => {
    if (req.session.userLoginStatus) {
        res.redirect('/')
    } else {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        userLoginError = req.session.userLoginError
        user = null
        req.session.userLoginError = false
        res.render('user/login/login', { user, userLoginError })
    }
}

//LOGIN PAGE - POST
const postLogin = (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
        if (response.userLoginStatus) {
            req.session.userData = response.user
            req.session.userLoginStatus = response.userLoginStatus

            if (req.session.UserUrlHistory) {
                res.redirect(req.session.UserUrlHistory)
                req.session.UserUrlHistory = null
            } else {
                res.redirect('/')
            }
        } else {
            req.session.user = response.user
            req.session.userLoginError = response.userLoginError
            res.redirect('/login')
        }
    })
}

//LOGIN PAGE - GET
const getLogout = (req, res) => {
    req.session.userLoginStatus = false
    res.redirect('/login')
}

//SIGNUP PAGE - GET
const getSignup = (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.render('user/login/signup', { user: false })
}

//SIGNUP PAGE - POST 
const postSignup = (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
        res.redirect('/login')
    })
}

//OTP PAGE - GET
const getOtpLogin = (req, res) => {

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.render('user/login/otp-login', { user: false })
}

//OTP PAGE - POST
const postOtpLogin = (req, res) => {
    userHelpers.doOtpLogin(req).then((response) => {
        if (response.user) {
            req.session.userData = response.user
            req.session.userLoginStatus = response.user.userLoginStatus
            res.redirect('/verify-otp')
        } else {
            res.render('user/login/otp-login', { user: false })
        }
    })
}

//GET VERIFY OTP
const getVerifyOtp = (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    guestUser = req.session.userData
    userLoginError = req.session.userLoginError
    res.render('user/login/verify-otp', { guestUser, user: false, userLoginError })
}

//POST VERIFY OTP
const postVerifyOtp = (req, res) => {
    userHelpers.doVerifyOtp(req).then((response) => {
        if (response.userLoginStatus) {

            req.session.userData = response.user
            req.session.userLoginStatus = response.userLoginStatus

            res.redirect('/')
            req.session.userLoginError = false
        } else {
            req.session.userLoginError = response.user.userLoginError
            res.redirect('/verify-otp')
        }
    })
}

//SHOP PAGE
const getShoppage = (req, res, next) => {
    productHelpers.getAllProducts().then(async (products) => {

        let cart = await cartHelpers.getCartProducts(user._id)
        let wishlist = await wishlistHelpers.getWishlist(user._id)

        //finding products in cart
        for (i = 0; i < cart.length; i++) {
            for (j = 0; j < products.length; j++) {
                cartId = cart[i].product._id.toString()
                productId = products[j]._id.toString()
                if (cartId == productId) {
                    products[j].productInCart = true
                }
            }
        }

        //finding products in wishlist
        for (i = 0; i < wishlist.length; i++) {
            for (j = 0; j < products.length; j++) {
                wishlistId = wishlist[i].product._id.toString()
                productId = products[j]._id.toString()
                if (wishlistId == productId) {
                    products[j].productInWishlist = true
                }
            }
        }


        res.render('user/shop/shop', { products })
    })
}

//GET SINGLE PRODUCT
const getSingleProduct = async (req, res) => {

    let productSlug = req.params.productSlug
    let productDetails = await productHelpers.getProductDetails(productSlug)
    discountAmount = (productDetails.regularPrice * productDetails.Discount) / 100
    let finalPrice = Math.round(productDetails.regularPrice - discountAmount)
    productDetails.finalPrice = finalPrice


    let cart = await cartHelpers.getCartProducts(user._id)
    let wishlist = await wishlistHelpers.getWishlist(user._id)

    productId = productDetails._id.toString()

    //finding products in cart
    for (i = 0; i < cart.length; i++) {
        cartId = cart[i].product._id.toString()
        if (cartId == productId) {
            productDetails.productInCart = true
        }
    }
    //finding products in wishlist
    for (i = 0; i < wishlist.length; i++) {
        wishlistId = wishlist[i].product._id.toString()
        if (wishlistId == productId) {
            productDetails.productInWishlist = true
        }
    }

    res.render('user/shop/single-product', { productDetails })
}

//ADD TO CART
const addToCart = (req, res) => {
    //FIXME ADD TO CART WHEN LOGGED OUT
    productId = req.params.id
    userId = user._id
    //console.log(productId,userId)
    cartHelpers.doAddToCart(productId, userId).then(() => {
        res.json({
            success: true
        })
    })
}

//GET - CART
const getCart = async (req, res) => {
    let products = await cartHelpers.getCartProducts(user._id)
    const couponInfo = await cartHelpers.getCartCouponInfo(user._id)
    res.render('user/cart/cart', { products, couponInfo })
}

//CHANGE PRODUCT QUANTITY
const changeProductQuantity = (req, res, next) => {
    cartHelpers.doChangeProductQuantity(req.body).then(async (response) => {
        response.cartTotal = await orderHelpers.getCheckoutData(req.session.userData._id)
        res.json(response)
    })
}

//DELETE PRODUCT FROM CART
const deleteProductFromCart = (req, res) => {
    cartHelpers.doDeleteProductFromCart(req.body).then(async (response) => {
        const cartItems = await cartHelpers.getCartProducts(user._id)
        response.cartItemsCount = cartItems.length
        res.json(response)
    })
}

//GET WISHLIST
const getWishlist = async (req, res) => {
    userId = req.session.userData._id
    let products = await wishlistHelpers.getWishlist(userId)
    adminDebug(products)
    res.render('user/cart/wishlist', { products })

}

//ADD TO WISHLIST
const addToWishlist = (req, res) => {
    productId = req.params.id
    userId = user._id
    //console.log(productId,userId);
    wishlistHelpers.addToWishlist(productId, userId).then(() => {
        res.json({
            success: true
        })
    })
}

//DELETE PRODUCT FROM CART
const deleteProductFromWishlist = (req, res) => {

    productId = req.body.product
    userId = user._id

    wishlistHelpers.deleteProductFromWishlist(userId, productId).then(async (response) => {
        const userWishlist = await wishlistHelpers.getWishlistCount(user._id)
        response.wishlistCount = userWishlist.products.length

        adminDebug(response)
        res.json(response)
    })
}

//ADD TO CART FROM WISHLIST
const addToCartFromWishlist = (req, res) => {

    productId = req.body.product
    wishlistId = req.body.wishlist
    userId = user._id

    wishlistHelpers.addToCartFromWishlist(productId, userId).then((response) => {
        wishlistHelpers.deleteProductFromWishlist(req.body).then(async (response) => {
            const userWishlist = await wishlistHelpers.getWishlistCount(user._id)
            response.wishlistCount = userWishlist.products.length
            res.json(response)
        })
    })
}

//GET CHECKOUT
const getCheckout = async (req, res) => {
    const cartTotal = await orderHelpers.getCheckoutData(user._id)
    const products = await cartHelpers.getCartProducts(user._id)
    const addressList = await userHelpers.getAddresses(user._id)
    const couponInfo = await cartHelpers.getCartCouponInfo(user._id)
    userDebug(cartTotal)
    res.render('user/cart/checkout', { cartTotal, products, addressList, couponInfo })
}

//APPLY COUPON
const applyCoupon = async (req, res) => {
    const cartTotal = await orderHelpers.getCheckoutData(user._id)
    result = await userHelpers.applyCoupon(req.body, cartTotal)
    res.redirect('/checkout')
}

//REMOVE COUPON
const removeCoupon = async (req, res) => {
    userId = req.params.id
    userDebug(userId)
    await userHelpers.removeCoupon(userId)

    res.redirect('/checkout')
}

//ADD NEW ADDRESS
const addNewAddres = (req, res) => {
    userHelpers.addNewAddres(req.body, user._id).then(() => {
        res.send('address added')
    })
}

//NEW ORDER
const getPlaceOrder = async (req, res) => {

    //create new order
    let orderInfo = await orderHelpers.newOrder(req.body)

    const { insertedId, cartTotal, paymentOption } = orderInfo

    if (paymentOption === 'razorPay') {
        userHelpers.generateRazorpay(insertedId, cartTotal, paymentOption).then((result) => {
            res.json(result)
        })
    } else if (paymentOption === 'Paypal') {
        await userHelpers.payWithPaypal(insertedId, cartTotal, paymentOption)
            .then((result) => {
                res.json(result)
            })
    } else {
        let result = {
            paymentOption: 'COD'
        }
        res.json(result)
    }

}

//RAZORPAY VERIFY PAYMENT 
const verifyPayment = (req, res) => {

    userId = req.session.userData._id

    userHelpers.verifyPayment(req.body).then((orderId) => {
        userHelpers.changePaymentStatus(orderId, userId).then(() => {
            res.json({ status: true })
        })
    }).catch((err) => {
        res.json({ status: false })
    })
}


//VERIFY PAYPAL
const verifyPaypal = (req, res) => {
    console.log('--------------payment success--------------');
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId
    };

    // Obtains the transaction details from paypal
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            //console.log(JSON.stringify(payment));
            orderId = payment.transactions[0].description
            userId = req.session.userData._id

            userHelpers.changePaymentStatus(orderId, userId).then(() => {
                res.redirect('/order-placed')
            })
        }
    });
}

//ORDER PLACED
const orderPlaced = (req, res) => {
    res.render('user/cart/order-placed')
}

//MY ACCOUNT
const myAccount = async (req, res) => {
    const orderList = await orderHelpers.getAllOrders(user._id)
    const addressList = await userHelpers.getAddresses(user._id)
    res.render('user/my-account/dashboard', { orderList, addressList })
}

//MY ADDRESS
const myAddress = async (req, res) => {
    const orderList = await orderHelpers.getAllOrders(user._id)
    const addressList = await userHelpers.getAddresses(user._id)
    res.render('user/my-account/my-address', { orderList, addressList })
}

//MY ORDERS
const myOrders = async (req, res) => {
    const orderList = await orderHelpers.getAllOrders(user._id)
    const addressList = await userHelpers.getAddresses(user._id)
    res.render('user/my-account/my-orders', { orderList, addressList })
}

//DELETE ADDRESS
const deleteAddress = async (req, res) => {
    const result = await userHelpers.doDeleteAddress(req.body)
    res.json(result)
}

//VIEW ORDER
const viewOrder = async (req, res) => {
    orderId = req.params.id
    const orderDetails = await userHelpers.viewOrder(orderId)
    res.render('user/my-account/single-order', { orderDetails })
}

//CANCEL ORDER
const cancelOrder = async (req, res) => {
    const orderStatus = await orderHelpers.cancelOrder(req.body)
    res.json(orderStatus)
}

//RETURN ORDER
const returnOrder = async (req, res) => {
    const orderStatus = await orderHelpers.returnOrder(req.body)
    res.json(orderStatus)
}


//CANCEL ORDER - COD
const cancelCodOrder = async (req, res) => {
    const orderStatus = await orderHelpers.cancelCodOrder(req.body)
    res.json(orderStatus)
}

//RETURN ORDER - COD
const returnCodOrder = async (req, res) => {
    const orderStatus = await orderHelpers.returnCodOrder(req.body)
    res.json(orderStatus)
}

module.exports = {
    getHomepage,

    getLogin,
    postLogin,
    getLogout,
    getSignup,
    postSignup,
    getOtpLogin,
    getVerifyOtp,
    postOtpLogin,
    postVerifyOtp,

    getShoppage,
    getSingleProduct,

    addToCart,
    getCart,
    changeProductQuantity,
    deleteProductFromCart,

    getCheckout,
    applyCoupon,
    removeCoupon,
    getPlaceOrder,
    orderPlaced,

    myAccount,
    myAddress,
    addNewAddres,
    deleteAddress,

    myOrders,
    viewOrder,
    cancelOrder,
    returnOrder,
    cancelCodOrder,
    returnCodOrder,

    verifyPayment,
    verifyPaypal,

    getWishlist,
    addToWishlist,
    deleteProductFromWishlist,
    addToCartFromWishlist,
}