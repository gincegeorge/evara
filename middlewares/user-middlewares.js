const cartHelpers = require('../helpers/cart-helpers')
const { adminDebug, debugDb } = require('../helpers/debug')
const orderHelpers = require('../helpers/order-helpers')
const db = require('../config/connection')
const collection = require('../config/collections');
const { PRODUCTS_CATEGORIES_COLLECTION } = require('../config/collections');


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

        //getting categories for header
        let categories = await db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).find().toArray()
        res.locals.categories = categories

        next()
    } else { 
        //getting categories for header
        let categories = await db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).find().toArray()
        res.locals.categories = categories

        req.session.UserUrlHistory = req.url
        res.redirect('/login')
    }
}

// const getUserData = async (req, res, next) => {
//     if (req.session.userLoginStatus) {
//         user = req.session.userData
//         let cart = {}
//         cart.products = await cartHelpers.getCartProducts(user._id)
//         cart.count = await cartHelpers.getCartCount(user._id)
//         cart.total = await orderHelpers.getCheckoutData(user._id)

//         user.userLoginStatus = req.session.userLoginStatus
//         user.cart = cart
//         res.locals.user = user

//         next()
//     } else {
//         next()
//     }
// }

module.exports = {
    verifyUserLogin,
    //getUserData
}  