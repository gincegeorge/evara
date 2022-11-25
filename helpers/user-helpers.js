const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')
const { CART_COLLECTION, PRODUCTS_CATEGORIES_COLLECTION, PRODUCTS_COLLECTION, USERS_COLLECTION, ORDER_COLLECTION, COUPON_COLLECTION } = require('../config/collections')
const objectId = require('mongodb').ObjectId
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const crypto = require("crypto")
const Razorpay = require("razorpay");
const CC = require('currency-converter-lt')
const currencyConverter = new CC()
const paypal = require('paypal-rest-sdk')
const { userDebug, adminDebug, debugDb } = require('./debug')



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
                if (data) {
                    resolve(userData)
                } else {
                    reject()
                }
            })
    }).catch((err) => {
        console.log(err);
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
                        if (response) {
                            resolve(response)
                        } else {
                            reject()
                        }
                    } else {
                        response.userLoginError = 'Incorrect password'
                        console.log('Incorrect password');
                        if (response) {
                            resolve(response)
                        } else {
                            reject()
                        }
                    }
                })
            } else {
                response.userLoginError = 'Account blocked'
                console.log('Account blocked')
                if (response) {
                    resolve(response)
                } else {
                    reject()
                }
            }
        } else {
            response.userLoginError = 'Incorrect email'
            console.log('Incorrect email')
            if (response) {
                resolve(response)
            } else {
                reject()
            }
        }
    }).catch((err) => {
        console.log(err);
    })
}

//USERS - GET
const getUsers = () => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.USERS_COLLECTION).find().toArray().then((users) => {
            if (users) {
                resolve(users)
            } else {
                reject()
            }
        })
    }).catch((err) => {
        console.log(err);
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
            if (userData) {
                resolve()
            } else {
                reject()
            }
        })
    }).catch((err) => {
        console.log(err);
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
            if (userData) {
                resolve()
            } else {
                reject()
            }
        })
    }).catch((err) => {
        console.log(err);
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
                    if (data) {
                        resolve(data)
                    } else {
                        reject()
                    }
                });

            if (response) {
                resolve(response)
            } else {
                reject()
            }
        } else {
            response.userLoginError = 'Phonenumber is not linked to any account'
            if (response) {
                resolve(response)
            } else {
                reject()
            }
        }
    }).catch((err) => {
        console.log(err);
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

                    if (response) {
                        resolve(response)
                    } else {
                        reject()
                    }
                } else {
                    response.user = req.session.user
                    response.user.userLoginStatus = false
                    response.user.userLoginError = 'Incorrect OTP'
                    console.log('failed')
                    if (response) {
                        resolve(response)
                    } else {
                        reject()
                    }
                }
            });
    }).catch((err) => {
        console.log(err);
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
            if (data) {
                resolve()
            } else {
                reject()
            }
        })
    }).catch((err) => {
        console.log(err);
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
                if (result) {
                    resolve(result)
                } else {
                    reject()
                }
            })
    }).catch((err) => {
        console.log(err);
    })
}

//APPLY COUPON
const applyCoupon = async (addedCoupon, cartTotal) => {
    let response = {}

    adminDebug(addedCoupon)
    //getting coupon data
    let coupon = await db.get().collection(COUPON_COLLECTION).findOne({ couponCode: addedCoupon.coupon })

    userDebug(coupon)

    const [currentDate, currentMonth, currentYear] = new Date().toLocaleDateString().split('/')
    const dateNow = currentYear + '-' + currentMonth + '-' + currentDate

    //check if coupon expired
    if (dateNow < coupon.expiryDate) {

        userDebug('coupon active')

        let couponUsed = await db.get().collection(COUPON_COLLECTION).findOne({ couponCode: addedCoupon.coupon, couponUsedBy: addedCoupon.userId })

        if (!couponUsed) {

            //calculating final price
            couponDiscount = coupon.couponDiscount

            response.discountedAmount = Math.round((cartTotal * couponDiscount / 100))

            //check if discount exeeds max coupon discount
            if (response.discountedAmount > coupon.couponMaxDiscount) {
                response.discountedAmount = coupon.couponMaxDiscount
                response.maxDiscount = true
            }

            response.isActive = true
            response.isUsed = false

            //updating cart
            await db.get().collection(CART_COLLECTION).updateOne(
                { user: objectId(addedCoupon.userId) },
                {
                    $set: {
                        couponApplied: addedCoupon.coupon,
                        couponIsActive: true,
                        couponIsUsed: false,
                        couponDiscount: response.discountedAmount,
                        couponDiscountPercentage: coupon.couponDiscount,
                    }
                })

        } else {
            userDebug('coupon used')
            response.isUsed = true

            //updating cart
            await db.get().collection(CART_COLLECTION).updateOne(
                { user: objectId(addedCoupon.userId) },
                {
                    $set: {
                        couponApplied: addedCoupon.coupon,
                        couponIsActive: true,
                        couponIsUsed: true,
                        couponDiscount: 0,
                        couponDiscountPercentage: coupon.couponDiscount
                    }
                })
        }
    } else {
        userDebug('coupon expired')
        response.isActive = false

        //updating cart
        await db.get().collection(CART_COLLECTION).updateOne(
            { user: objectId(addedCoupon.userId) },
            {
                $set: {
                    couponApplied: addedCoupon.coupon,
                    couponIsActive: false,
                    couponIsUsed: false,
                    couponDiscount: 0,
                    couponDiscountPercentage: coupon.couponDiscount
                }
            })
    }
    return response;
}

//REMOVE COUPON
const removeCoupon = async (userId) => {
    await db.get().collection(CART_COLLECTION).updateOne(
        { user: objectId(userId) },
        {
            $unset: {
                couponApplied: "",
                couponDiscount: "",
                couponIsActive: "",
                couponIsUsed: "",
                couponDiscountPercentage: ""
            }
        }
    )
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
                if (result) {
                    resolve(result)
                } else {
                    reject()
                }
            })
    }).catch((err) => {
        console.log(err);
    })

}

//VIEW SINGLE ORDER
const viewOrder = async (orderId) => {
    return new Promise(async (resolve, reject) => {
        await db.get().collection(ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            .then((result) => {
                if (result) {
                    resolve(result)
                } else {
                    reject()
                }
            })
    }).catch((err) => {
        console.log(err);
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
                if (order) {
                    resolve(order)
                } else {
                    reject()
                }
            }
        });
    }).catch((err) => {
        console.log(err);
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
    }).catch((err) => {
        console.log(err);
    })
}

//CHANGE PAYMENT STATUS
const changePaymentStatus = (orderId, userId) => {

    console.log(orderId, userId);

    return new Promise(async (resolve, reject) => {

        //update order status 
        await db.get().collection(ORDER_COLLECTION).updateOne(
            { _id: objectId(orderId) },
            { $set: { orderPlaced: true, orderStatus: 'Processing' } }
        )

        //update payment status of products
        await db.get()
            .collection(ORDER_COLLECTION)
            .updateMany(
                { _id: objectId(orderId) },
                { $set: { "products.$[].productOrderStatus": 'Processing', "products.$[].productpaymentStatus": 'Success' } }
            )

        //clearing cart
        await db.get().collection(CART_COLLECTION).deleteOne({ user: objectId(userId) })

        resolve()
    }).catch((err) => {
        console.log(err);
    })
}


const payWithPaypal = async (orderId, cartTotal, paymentOption) => {

    console.log(orderId, cartTotal, paymentOption);

    let priceInUSD = await currencyConverter.from("INR").to("USD").amount(cartTotal).convert()


    let result = {}

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "https://evara.ml/success",
            "cancel_url": "https://evara.ml/cancel"
        },
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": priceInUSD.toFixed(2)
            },
            'description': orderId
        }
        ]
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

                        if (result) {
                            resolve(result)
                        } else {
                            reject()
                        }
                        // res.redirect(payment.links[i].href);
                    }
                }
            }
        });
    }).catch((err) => {
        console.log(err);
    })
}

//REFUND
const refundToWallet = async (userId, amountToBeRefunded) => {
    await db.get().collection(USERS_COLLECTION).updateOne(
        { _id: objectId(userId) },
        {
            $inc: { wallet: amountToBeRefunded }
        }
    )
}


//searchResults

const searchResults = async (searchQuery) => {
    userDebug(searchQuery)
    try {
        return await db.get().collection(PRODUCTS_COLLECTION).find({ name: new RegExp('^' + searchQuery + '.*', 'i') }).limit(5).toArray()
    } catch (error) {
        console.log(error);
    }


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

    applyCoupon,
    removeCoupon,
    generateRazorpay,
    verifyPayment,
    changePaymentStatus,
    payWithPaypal,
    refundToWallet,

    searchResults
}
