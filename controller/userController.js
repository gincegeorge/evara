var userHelpers = require('../helpers/user-helpers')
var productHelpers = require('../helpers/product-helpers')

const getHomepage = async (req, res, next) => {
    productHelpers.getAllProducts().then((products) => {
        res.render('user/index', { products })
    })
}

const getShoppage = (req, res, next) => {
    productHelpers.getAllProducts().then((products) => {
        res.render('user/shop', { user, products })
    })
}
const getLogin = (req, res) => {
    if (req.session.userLoginStatus) {
        res.redirect('/')
    } else {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        userLoginError = req.session.userLoginError
        user = null
        res.render('user/login', { user, userLoginError })
        req.session.userLoginError = false
    }
}

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

const getLogout = (req, res) => {
    req.session.userLoginStatus = false
    res.redirect('/login')
}

const getSignup = (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.render('user/signup', { user: false })
}

const postSignup = (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
        res.redirect('/login')
    })
}

const getOtpLogin = (req, res) => {

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.render('user/otp-login', { user: false })
}

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

const getVerifyOtp = (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    guestUser = req.session.userData
    userLoginError = req.session.userLoginError
    res.render('user/verify-otp', { guestUser, user: false, userLoginError })
}

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

const getSingleProduct = async (req, res) => {
    let productSlug = req.params.productSlug
    let productDetails = await productHelpers.getProductDetails(productSlug);
    res.render('user/single-product', { productDetails })
}

const addToCart = (req, res) => {
    productId = req.params.id
    userId = user._id
    userHelpers.doAddToCart(productId, userId).then(() => {
        res.json({
            success: true
        })
    })
}

const getCart = async (req, res) => {
    let products = await userHelpers.getCartProducts(user._id)
    console.log(products);
    res.render('user/cart', { products })
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
    getCart
}