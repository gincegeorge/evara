var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')
const { render } = require('../app')
const { ReturnDocument } = require('mongodb')
var objectId = require('mongodb').ObjectId
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const doSignup = (userData) => {
    return new Promise(async (resolve, reject) => {
        userData.isBlocked = false
        userData.password = await bcrypt.hash(userData.password, 10)
        db.get()
            .collection(collection.USERS_COLLECTION)
            .insertOne(userData)
            .then((data) => {
                resolve(userData)
            })
    })
}

const doLogin = (userData) => {
    return new Promise(async (resolve, reject) => {
        let userLoginStatus = false
        let response = {}
        let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ email: userData.email })
        if (user) {

            if (!user.isBlocked) {
                bcrypt.compare(userData.password, user.password).then((userLoginStatus) => {
                    if (userLoginStatus) {
                        console.log('login success') 
                        response.user = user
                        response.userLoginStatus = true
                        console.log(response);
                        console.log('----------------------------------------------------------');
                        resolve(response)
                    } else {
                        response.userLoginError = 'Incorrect password'
                        resolve(response)
                        console.log('Incorrect password');
                    }
                })
            } else {
                response.userLoginError = 'Account blocked'
                resolve(response)
                console.log('Account blocked')
            }
        } else {
            response.userLoginError = 'Incorrect email'
            resolve(response)
            console.log('Incorrect email')
        }
    })
}

const getUsers = () => {
    return new Promise((resolve, reject) => {
        let users = db.get().collection(collection.USERS_COLLECTION).find().toArray()
        resolve(users)
    })
}

const doBlockUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collections.USERS_COLLECTION).updateOne({ _id: objectId(userId) }, {
            $set: {
                isBlocked: true
            }
        }).then((userData) => {
            resolve()
        })
    })
}

const doUnblockUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collections.USERS_COLLECTION).updateOne({ _id: objectId(userId) }, {
            $set: {
                isBlocked: false
            }
        }).then((userData) => {
            resolve()
        })
    })
}

const doOtpLogin = (req) => {
    return new Promise(async (resolve, reject) => {
        let userloginStatus = false;
        let response = {}
        let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ phonenumber: req.body.phonenumber })
        req.session.user = user
        if (user) {
            response.user = user
            response.user.userLoginStatus = false

            phonenumber = ('+91' + req.body.phonenumber)
            req.session.phonenumber = phonenumber
            client.verify
                .services(process.env.SERVICE_ID)
                .verifications.create({
                    to: (phonenumber),
                    channel: "sms",
                })
                .then((data) => {
                    resolve(data)
                });

            resolve(response)
        } else {
            response.userLoginError = 'Incorrect email'
            resolve(response)
        }
    })
}

const doVerifyOtp = (req) => {
    return new Promise((resolve, reject) => {
        let response = {}
        otp = req.body.otp
        console.log(otp);
        console.log(req.session.phonenumber);
        console.log(req.session.user);

        client.verify
            .services(process.env.SERVICE_ID)
            .verificationChecks.create({
                to: req.session.phonenumber,
                code: otp,
            })
            .then((data) => {
                if (data.status === "approved") {

                    response.user = req.session.user
                    response.user.userLoginStatus = true

                    console.log('User is Verified!!')
                    
                    resolve(response)
                } else {
                    response.user = req.session.user
                    response.user.userLoginStatus = false
                    response.user.userLoginError = 'Incorrect OTP'
                    console.log('failed')
                    resolve(response)
                }
            });
    })

}

module.exports = {
    doSignup,
    doLogin,
    getUsers,
    doBlockUser,
    doUnblockUser,
    doOtpLogin,
    doVerifyOtp
}
