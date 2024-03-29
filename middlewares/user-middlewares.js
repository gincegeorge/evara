/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
const cartHelpers = require('../helpers/cart-helpers');
const orderHelpers = require('../helpers/order-helpers');
const db = require('../config/connection');
const { PRODUCTS_CATEGORIES_COLLECTION } = require('../config/collections');
const { adminDebug, debugDb } = require('../helpers/debug');

// verify user login
const verifyUserLogin = async (req, res, next) => {
  
  if (req.session.userLoginStatus) {
    user = req.session.userData;
    const cart = {};
    cart.products = await cartHelpers.getCartProducts(user._id);
    cart.count = await cartHelpers.getCartCount(user._id);
    cart.total = await orderHelpers.getCheckoutData(user._id);

    user.userLoginStatus = req.session.userLoginStatus;
    user.cart = cart;
    res.locals.user = user;

    // getting categories for header
    const categories = await db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).find().toArray();
    res.locals.categories = categories;

    next();
  } else {
    // getting categories for header
    const categories = await db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).find().toArray();
    res.locals.categories = categories;

    req.session.UserUrlHistory = req.url;

    if (req.xhr) {
      req.session.UserUrlHistory = req.session.pageWithoutLogin;
      res.json({
        loginRedirect: true,
      });
    } else {
      res.redirect('/login');
    }
  }
};

const accessWithoutLogin = async (req, res, next) => {

  if (req.session.userLoginStatus) {
    user = req.session.userData;

    const cart = {};
    cart.products = await cartHelpers.getCartProducts(user._id);
    cart.count = await cartHelpers.getCartCount(user._id);
    cart.total = await orderHelpers.getCheckoutData(user._id);

    adminDebug(cart.total)

    user.userLoginStatus = req.session.userLoginStatus;
    user.cart = cart;
    res.locals.user = user;

    // getting categories for header
    const categories = await db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).find().toArray();
    res.locals.categories = categories;

    next();

  } else {
    // getting categories for header
    const categories = await db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).find().toArray();
    res.locals.categories = categories;

    req.session.pageWithoutLogin = req.url;
    next();
  }
};

module.exports = {
  verifyUserLogin,
  accessWithoutLogin,
  // getUserData
};
