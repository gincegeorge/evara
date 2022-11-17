const db = require('../config/connection')
const collection = require('../config/collections');
const { ADMIN_COLLECTION } = require('../config/collections');
const path = require('path');

//Verify admin login status
const verifyAdminLogin = async (req, res, next) => {
  if (req.session.adminData) {

    //GETTING THEME
    let admin = await db.get().collection(ADMIN_COLLECTION).findOne({ 'username': 'admin@gmail.com' })
    res.locals.theme = admin.theme
    
    //MENU URL
    res.locals.menuUrl = req.path.split('/')[1] 
    next()
  } else {
    req.session.urlHistory = req.url
    res.redirect('/admin/login')
  }
}

module.exports = {
  verifyAdminLogin
}  