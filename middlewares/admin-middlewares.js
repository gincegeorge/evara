//Verify admin login status
const verifyAdminLogin = (req, res, next) => {
    if (req.session.adminData) {
      next()
    } else {
      req.session.urlHistory = req.url
      res.redirect('/admin/login')
    }
  } 
 
module.exports = {
    verifyAdminLogin
}  