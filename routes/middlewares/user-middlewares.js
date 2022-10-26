var userHelpers = require('../../helpers/user-helpers')

//verify user login
const verifyUserLogin = async (req, res, next) => {
    if (req.session.userLoginStatus) {

        user = req.session.userData

        let cartCount = await userHelpers.getCartCount(user._id)

        user.userLoginStatus = req.session.userLoginStatus

        user.cartCount = cartCount

        res.locals.user = user

        next()
    } else {
        req.session.UserUrlHistory = req.url
        res.redirect('/login')
    }
}

module.exports = {
    verifyUserLogin
}  