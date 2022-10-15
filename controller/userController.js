var userHelpers = require('../helpers/user-helpers')

const getHomepage = function (req, res, next) {
    res.render('user/index', { user })
}
const getShoppage = (req, res, next) => {
    res.render('user/shop', { user })
}
const getLogin = (req, res) => {
    if (req.session.userLoginStatus) {
        res.redirect('/')
    } else {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        userLoginError = req.session.userLoginError
        res.render('user/login', { userLoginError })
        req.session.userLoginError = false
    }
}

const postLogin = (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
        if (response.userLoginStatus) {
            req.session.userData = response.user
            req.session.userLoginStatus = response.userLoginStatus
            userLoginStatus = req.session.userLoginStatus
            res.redirect('/')
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
    res.render('user/signup')
}

const postSignup = (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
        res.redirect('/login')
    })
}

module.exports = {
    getHomepage,
    getShoppage,
    getLogin,
    postLogin,
    getLogout,
    getSignup,
    postSignup
}