var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')
var objectId = require('mongodb').ObjectId

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
        let userloginStatus = false;
        let response = {}
        let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ email: userData.email })
        if (user) {

            if (!user.isBlocked) {
                bcrypt.compare(userData.password, user.password).then((userLoginStatus) => {
                    if (userLoginStatus) {
                        console.log('login success');
                        response.userLoginStatus = true
                        response.user = user
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
                console.log('Account blocked');
            }
        } else {
            response.userLoginError = 'Incorrect email'
            resolve(response)
            console.log('Incorrect email');
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

module.exports = {
    doSignup,
    doLogin,
    getUsers,
    doBlockUser,
    doUnblockUser
}
