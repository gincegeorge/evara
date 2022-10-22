//verify user login
const verifyUserLogin = (req, res, next) => {
    if (req.session.userLoginStatus) {
        user = req.session.userData
        user.userLoginStatus = req.session.userLoginStatus
        next()
    } else {
        req.session.UserUrlHistory = req.url
        res.redirect('/login')
    }
}

module.exports = {
    verifyUserLogin
}  