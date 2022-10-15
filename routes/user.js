var express = require('express');
const { response } = require('../app');
var router = express.Router();
const userController = require('../controller/userController')

//verify user login
const verifyUserLogin = (req,res,next)=>{
  if(req.session.userLoginStatus){
    user = req.session.userData
    userLoginStatus = req.session.userLoginStatus
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', verifyUserLogin,userController.getHomepage)

//GET shop page
router.get('/shop',verifyUserLogin,userController.getShoppage)

//GET login page
router.get('/login',userController.getLogin)

//POST login page
router.post('/login',userController.postLogin)

//GET logout
router.get('/logout',userController.getLogout)

//GET signup page
router.get('/signup',userController.getSignup)

//POST signup page
router.post('/signup',userController.postSignup)
 
module.exports = router