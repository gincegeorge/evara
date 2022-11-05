var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')
const { render, response } = require('../app')
const { ReturnDocument } = require('mongodb')
const { CART_COLLECTION, PRODUCTS_CATEGORIES_COLLECTION, PRODUCTS_COLLECTION, USERS_COLLECTION, ORDER_COLLECTION } = require('../config/collections')
var objectId = require('mongodb').ObjectId
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const crypto = require("crypto")
const { resolve } = require('path')
const Razorpay = require("razorpay");

const CC = require('currency-converter-lt')
let currencyConverter = new CC()
const paypal = require('paypal-rest-sdk')

//PAYPAL PAYMENT
paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
})

// RAZORPAY INSTANCE 
var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
    ,
});

//SIGNUP POST
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

//LOGIN USER
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

//USERS - GET
const getUsers = () => {
    return new Promise((resolve, reject) => {
        let users = db.get().collection(collection.USERS_COLLECTION).find().toArray()
        resolve(users)
    })
}

//BLOCK USER
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

//UNBLOCK USER
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

//OTP LOGIN
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
            response.userLoginError = 'Phonenumber is not linked to any account'
            resolve(response)
        }
    })
}

//VERIFY OTP
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
                    response.userLoginStatus = true

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


//ADD ADDRESS
const addNewAddres = (formData, userId) => {

    formData._id = objectId()

    return new Promise(async (resolve, reject) => {
        await db.get().collection(USERS_COLLECTION).updateOne(
            { _id: objectId(userId) }, {
            $addToSet: {
                address: formData
            }
        }, { $upsert: true }
        ).then((data) => {
            resolve()
        })
    })
}

//ADDRESS - GET
const getAddresses = (userId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(USERS_COLLECTION)
            .aggregate([
                { $match: { _id: objectId(userId) } },
                { $project: { address: 1, _id: 0 } },
                { $unwind: '$address' }
            ]).toArray()
            .then((result) => {
                resolve(result)
            })
    }).catch((err) => {
        console.log(err);
    })
}

// ADDRESSS - DELETE
const doDeleteAddress = (data) => {

    const { userId, addressId } = data

    return new Promise((resolve, reject) => {
        db.get().collection(USERS_COLLECTION).updateOne(
            { _id: objectId(userId) },
            { $pull: { address: { _id: objectId(addressId) } } }
        )
            .then((result) => {
                resolve(result)
            })
    })

}

//VIEW SINGLE ORDER
const viewOrder = async (orderId) => {
    return new Promise(async (resolve, reject) => {
        await db.get().collection(ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            .then((result) => {
                resolve(result)
            })
    })
}

//RAZORPAY
const generateRazorpay = (orderId, totalPrice, paymentOption) => {

    return new Promise((resolve, reject) => {
        var options = {
            amount: totalPrice * 100,
            currency: "INR",
            receipt: orderId + ""
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log(err);
            } else {
                order.paymentOption = paymentOption
                resolve(order)
            }
        });
    })
}

//VERIFY PAYMENT
const verifyPayment = (paymentInfo) => {

    return new Promise((resolve, reject) => {

        let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)
            .update(paymentInfo['payment[razorpay_order_id]'] + "|" + paymentInfo['payment[razorpay_payment_id]'])
            .digest('hex')

        if (hmac == paymentInfo['payment[razorpay_signature]']) {
            resolve(paymentInfo['order[receipt]'])
        } else {
            reject()
        }
    })
}

//CHANGE PAYMENT STATUS
const changePaymentStatus = (orderId, userId) => {

    console.log(orderId, userId);

    return new Promise(async (resolve, reject) => {

        //update order status 
        await db.get().collection(ORDER_COLLECTION).updateOne(
            { _id: objectId(orderId) },
            { $set: { paymentStatus: 'success', orderStatus: 'Processing' } }
        )

        //update payment status of products
        await db.get()
            .collection(ORDER_COLLECTION)
            .updateMany(
                { _id: objectId(orderId) },
                { $set: { "products.$[].productOrderStatus": 'Processing', "products.$[].productpaymentStatus": 'Success' } }
            )



        //clearing cart
        db.get().collection(CART_COLLECTION).deleteOne({ user: objectId(userId) })

        resolve()
    })
}


const payWithPaypal = async(orderId, cartTotal, paymentOption) => {

    console.log(orderId, cartTotal, paymentOption);

    let priceInUSD = await currencyConverter.from("INR").to("USD").amount(cartTotal).convert()


    let result = {}

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:8080/success",
            "cancel_url": "http://localhost:8080/cancel"
        },
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": priceInUSD.toFixed(2)
            }
        }]
    };

    return new Promise((resolve, reject) => {
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {

                        result.paymentOption = paymentOption
                        result.redirectLink = payment.links[i].href
                        result.orderId = orderId

                        resolve(result)
                        // res.redirect(payment.links[i].href);
                    }
                }
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
    doVerifyOtp,
    addNewAddres,
    getAddresses,
    doDeleteAddress,
    //getMyAccount,
    viewOrder,
    generateRazorpay,
    verifyPayment,
    changePaymentStatus,
    payWithPaypal
}
