const cartHelpers = require('../helpers/cart-helpers')
const orderHelpers = require('../helpers/order-helpers')

//verify user login
const verifyUserLogin = async (req, res, next) => {
    if (req.session.userLoginStatus) {

        user = req.session.userData

        let cart = {}

        cart.products = await cartHelpers.getCartProducts(user._id)
        cart.count = await cartHelpers.getCartCount(user._id)
        cart.total = await orderHelpers.getCheckoutData(user._id)

        user.userLoginStatus = req.session.userLoginStatus

        user.cart = cart

        res.locals.user = user

        next()
    } else {
        req.session.UserUrlHistory = req.url
        res.redirect('/login')
    }
}

const getUserData = async (req, res, next) => {
    if (req.session.userLoginStatus) {

        user = req.session.userData

        let cart = {}

        cart.products = await cartHelpers.getCartProducts(user._id)
        cart.count = await cartHelpers.getCartCount(user._id)
        cart.total = await orderHelpers.getCheckoutData(user._id)

        user.userLoginStatus = req.session.userLoginStatus

        user.cart = cart

        res.locals.user = user

        next()
    }else{
        next()
    }
}

module.exports = {
    verifyUserLogin,
    getUserData
}  