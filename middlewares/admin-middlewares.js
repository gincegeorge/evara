/* eslint-disable linebreak-style */
const path = require('path');
const db = require('../config/connection');
const { ADMIN_COLLECTION } = require('../config/collections');

// Verify admin login status
const verifyAdminLogin = async (req, res, next) => {
  if (req.session.adminData) {
    // GETTING THEME
    const admin = await db.get().collection(ADMIN_COLLECTION).findOne({ username: 'admin@gmail.com' });
    res.locals.theme = admin.theme;

    // MENU URL
    // eslint-disable-next-line prefer-destructuring
    res.locals.menuUrl = req.path.split('/')[1];
    next();
  } else {
    req.session.urlHistory = req.url;
    res.redirect('/admin/login');
  }
};

module.exports = {
  verifyAdminLogin,
};
