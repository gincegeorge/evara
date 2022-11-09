const userHelpers = require('../helpers/user-helpers')
const productHelpers = require('../helpers/product-helpers')
const cartHelpers = require('../helpers/cart-helpers')
const orderHelpers = require('../helpers/order-helpers')
// const { response } = require('../app')
const paypal = require('paypal-rest-sdk')
const { userDebug } = require('../helpers/debug')


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

//SHOP PAGE
const getShoppage = (req, res, next) => {
    productHelpers.getAllProducts().then((products) => {
        res.render('user/shop/shop', { products })
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
        res.render('user/login/login', { user, userLoginError })
        req.session.userLoginError = false
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
            res.render('user/otp-login', { user: false })
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

//GET SINGLE PRODUCT
const getSingleProduct = async (req, res) => {
    let productSlug = req.params.productSlug
    let productDetails = await productHelpers.getProductDetails(productSlug);

    discountAmount = (productDetails.regularPrice * productDetails.Discount) / 100

    let finalPrice = productDetails.regularPrice - discountAmount

    productDetails.finalPrice = finalPrice

    res.render('user/shop/single-product', { productDetails })
}

//ADD TO CART
const addToCart = (req, res) => {
    //FIXME ADD TO CART WHEN LOGGED OUT
    productId = req.params.id
    userId = user._id
    //console.log(productId,userId);
    cartHelpers.doAddToCart(productId, userId).then(() => {
        res.json({
            success: true
        })
    })
}

//GET - CART
const getCart = async (req, res) => {
    let products = await cartHelpers.getCartProducts(user._id)

    userDebug(products)


    res.render('user/cart/cart', { products })
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

//GET CHECKOUT
const getCheckout = async (req, res) => {
    const cartTotal = await orderHelpers.getCheckoutData(user._id)
    const products = await cartHelpers.getCartProducts(user._id)
    const addressList = await userHelpers.getAddresses(user._id)
    res.render('user/cart/checkout', { cartTotal, products, addressList })
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

                req.session.paypalOrderId = result.orderId
                //FIXME GET ORDER ID FROM PAYPAL

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
    getShoppage,
    getLogin,
    postLogin,
    getLogout,
    getSignup,
    postSignup,
    getOtpLogin,
    getVerifyOtp,
    postOtpLogin,
    postVerifyOtp,
    getSingleProduct,
    addToCart,
    getCart,
    changeProductQuantity,
    deleteProductFromCart,
    getCheckout,
    getPlaceOrder,
    addNewAddres,
    orderPlaced,
    myAccount,
    myAddress,
    myOrders,
    deleteAddress,
    viewOrder,
    cancelOrder,
    verifyPayment,
    returnOrder,
    cancelCodOrder,
    returnCodOrder,
    verifyPaypal
}