const db = require('../config/connection')
const collection = require('../config/collections');
const { ORDER_COLLECTION, PRODUCTS_COLLECTION, PRODUCTS_CATEGORIES_COLLECTION, COUPON_COLLECTION, ADMIN_COLLECTION } = require('../config/collections');
const { adminDebug, debugDb, userDebug } = require('./debug');
const objectId = require('mongodb').ObjectId


const doAdminLogin = (adminData) => {
    let adminCredentials = { email: 'admin@mail.com', password: '1233' };
    let response = {}
    return new Promise((resolve, reject) => {
        if (adminCredentials.email == adminData.email) {
            if (adminCredentials.password == adminData.password) {
                console.log('Credentials match');
                response.adminData = adminCredentials
                response.adminLoginStatus = true
                if (response) {
                    resolve(response)
                } else {
                    reject()
                }

            }
            else {
                console.log('Incorrect password');
                response.adminLoginStatus = false
                response.adminLoginError = 'Incorrect password'
                if (response) {
                    resolve(response)
                } else {
                    reject()
                }
            }
        } else {
            console.log('Incorrect email');
            response.adminLoginError = 'Invalid email'
            response.adminLoginStatus = false
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


const getAllOrders = () => {
    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).find().sort({ 'date': -1 }).toArray().then((result) => {
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

const viewSingleOrder = (orderId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).findOne({ _id: objectId(orderId) }).then((orderDetails) => {
            if (orderDetails) {
                resolve(orderDetails)
            } else {
                reject()
            }
        })
    }).catch((err) => {
        console.log(err);
    })
}


const changeOrderStatus = (orderDetails) => {

    const { orderId, productId, orderStatus } = orderDetails

    if (orderStatus === 'Delivered') {

        return new Promise(async (resolve, reject) => {
            await db.get().collection(ORDER_COLLECTION)
                .updateOne(
                    {
                        _id: objectId(orderId),
                        'products.item': objectId(productId)
                    },
                    {
                        $set: { 'products.$.productOrderStatus': orderStatus, 'products.$.productpaymentStatus': 'Success' }
                    })

                .then((result) => {
                    if (result) {
                        resolve(result)
                    } else {
                        reject()
                    }
                })

        }).catch((err) => {
            console.log(err);
            console.log(err);
        })

    } else {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(ORDER_COLLECTION)
                .updateOne(
                    {
                        _id: objectId(orderId),
                        'products.item': objectId(productId)
                    },
                    {
                        $set: { 'products.$.productOrderStatus': orderStatus }
                    })

                .then((result) => {
                    if (result) {
                        resolve(result)
                    } else {
                        reject()
                    }
                })

        }).catch((err) => {
            console.log(err);
            console.log(err);
        })
    }
}


//CANCEL ORDER - ONLINE PAYMENT
const cancelOrder = (orderDetails) => {

    const { orderId, productId, newOrderStatus, paymentStatus } = orderDetails

    return new Promise(async (resolve, reject) => {

        await db.get().collection(ORDER_COLLECTION)

            .updateOne(
                {
                    _id: objectId(orderId),
                    'products.item': objectId(productId)
                },
                {
                    $set: { 'products.$.productOrderStatus': newOrderStatus, 'products.$.productpaymentStatus': paymentStatus }
                })

            .then((result) => {
                if (result) {
                    resolve(result)
                } else {
                    reject()
                }
            })
    }).catch((err) => {
        console.log(err);
        console.log(err);
    })
}

//CANCEL ORDER - COD
const cancelCodOrder = (orderDetails) => {

    const { orderId, productId, newOrderStatus } = orderDetails

    return new Promise(async (resolve, reject) => {

        await db.get().collection(ORDER_COLLECTION)

            .updateOne(
                {
                    _id: objectId(orderId),
                    'products.item': objectId(productId)
                },
                {
                    $set: { 'products.$.productOrderStatus': newOrderStatus }
                })

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

//GET PRODUCTS COUNT
const getProductsCount = async () => {
    return new Promise((resolve, reject) => {
        db.get().collection(PRODUCTS_COLLECTION).count()
            .then((result) => {
                if (result) {
                    resolve(result)
                } else {
                    reject('errrr')
                }
            })
    }).catch((err) => {
        console.log(err);
    })
}

//GET CATEGORIES COUNT
const getCategoriesCount = () => {
    return new Promise((resolve, reject) => {
        db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).count().
            then((result) => {
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

// GET TOTAL REVENUE
const getTotalRevenue = async () => {

    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).aggregate([
            {
                $match: { 'orderPlaced': true }
            },
            {
                $group: {
                    _id: 'orderPlaced',
                    revenue: { $sum: '$cartTotal' }
                }
            },
            {
                $project: {
                    _id: 0, revenue: 1
                }
            }
        ]).toArray()
            .then((result) => {
                if (result) {
                    resolve(result[0])
                } else {
                    reject('errrr')
                }
            })
    }).catch((err) => {
        console.log(err);
    })
}

//GET TOTAL NUMBER OF ORDERS
const getTotalOrders = () => {
    return new Promise((resolve, reject) => {

        db.get().collection(ORDER_COLLECTION).count()
            .then((result) => {
                if (result) {
                    resolve(result)
                } else {
                    reject('errrr')
                }
            })
    })
        .catch((err) => {
            console.log(err);
        })
}

//TOTAL REVENUE BY CATEGORY
const revenueByPaymentOption = () => {
    return new Promise((resolve, reject) => {

        const d = new Date();
        let month = d.getMonth();
        let year = d.getFullYear();

        let oneMonthBefore = year + '-' + month

        db.get().collection(ORDER_COLLECTION).aggregate([
            {
                $match: { 'orderPlaced': true, 'date': { $gte: new Date(oneMonthBefore) } }
            },
            {
                $group: {
                    _id: '$paymentOption',
                    revenue: { $sum: '$cartTotal' }
                }
            },
            {
                $sort: {
                    revenue: 1
                }
            }
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

//MONTHLY REVENUE
const monthlyRevenue = () => {

    const d = new Date();
    let day = d.getDate();
    let month = d.getMonth();
    let year = d.getFullYear();

    let oneMonthBefore = year + '-' + month + '-' + day

    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).aggregate([
            {
                $match: { 'orderPlaced': true, 'date': { $gte: new Date(oneMonthBefore) } }
            },
            {
                $group: {
                    _id: 'orderPlaced',
                    revenue: { $sum: '$cartTotal' }
                }
            },
            {
                $project: {
                    _id: 0, revenue: 1
                }
            }
        ]).toArray().then((result) => {
            if (result) {
                resolve(result[0])
            } else {
                reject('errrr')
            }
        })
    }).catch((err) => {
        console.log(err);
    })
}

//GET LINECHART
const monthlyData = () => {

    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).aggregate([
            {
                $match: { 'orderPlaced': true }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    revenue: { $sum: '$cartTotal' },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 }
            },
            {
                $limit: 7
            }
        ]).toArray().then((result) => {
            if (result) {
                resolve(result)
            } else {
                reject('errrr')
            }
        })
    }).catch((err) => {
        console.log(err);
    })
}

//GET DAILY REPORT
const getDailyReport = (date) => {

    startDate = date.date + 'T00:00:00'
    endDate = date.date + 'T23:59:59'

    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).aggregate([
            {
                $match: { "date": { $gte: new Date(startDate), $lte: new Date(endDate) }, orderPlaced: true }
            },
            {
                $project: { _id: 0, cartTotal: 1, paymentOption: 1, orderId: 1, products: 1 }
            }
        ]).toArray().then((result) => {
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

//GET MONTHLY REPORT
const getMonthlyReport = (monthAndYear) => {

    //Create end date of the month
    const [year, month] = monthAndYear.toString().split('-')
    var d = new Date(year, month, 0);
    const day = d.toString().split(' ')[2]

    let startDate = year + '-' + month + '-01'
    let endDate = year + '-' + month + '-' + day

    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).aggregate([
            {
                $match: { "date": { $gte: new Date(startDate), $lte: new Date(endDate) }, orderPlaced: true }
            },
            {
                $project: { _id: 0, cartTotal: 1, paymentOption: 1, orderId: 1, products: 1 }
            }
        ]).toArray().then((result) => {
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

//YEARLY REPORT 
const getYearlyReport = (year) => {
    startDate = year + '-01-01'
    endDate = year + '-12-31'
    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).aggregate([
            {
                $match: { "date": { $gte: new Date(startDate), $lte: new Date(endDate) }, orderPlaced: true }
            },
            {
                $project: { _id: 0, cartTotal: 1, paymentOption: 1, orderId: 1, products: 1 }
            }
        ]).toArray().then((result) => {
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

//NEW COUPON
const createNewCoupon = (couponData) => {

    couponData.date = new Date()

    return new Promise((resolve, reject) => {
        db.get().collection(COUPON_COLLECTION).insertOne(couponData)
            .then((response) => {
                if (response) {
                    resolve(response)
                } else {
                    reject()
                }
            })
    }).catch((err) => {
        adminDebug(err);
    })
}

//GET COUPONS
const getCoupons = async () => {
    return await db.get().collection(COUPON_COLLECTION).find().sort({ expiryDate: -1 }).toArray()
}

//EDIT COUPON
const getEditCoupon = async (couponId) => {
    return await db.get().collection(COUPON_COLLECTION).findOne({ _id: objectId(couponId) })
}

//POST EDIT COUPON
const postEditCoupon = async (couponDetails) => {
    couponId = couponDetails.id
    return await db.get().collection(COUPON_COLLECTION).updateOne(
        { _id: objectId(couponId) },
        {
            $set: {
                couponCode: couponDetails.couponCode,
                couponDiscount: couponDetails.couponDiscount,
                expiryDate: couponDetails.expiryDate
            }
        })
}

//DELETE COUPON
const deleteCoupon = async (couponId) => {
    await db.get().collection(COUPON_COLLECTION).deleteOne(
        { _id: objectId(couponId) }
    )
}

const changeDarkMode = async (mode) => {
    try {
        return db.get().collection(ADMIN_COLLECTION).updateOne({ 'username': 'admin@gmail.com' }, { $set: { theme: mode } })
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    //login
    doAdminLogin,
    getAllOrders,
    viewSingleOrder,

    //order status
    changeOrderStatus,
    cancelOrder,
    cancelCodOrder,

    //dashboard
    changeDarkMode,
    getProductsCount,
    getCategoriesCount,
    getTotalRevenue,
    getTotalOrders,
    revenueByPaymentOption,
    monthlyRevenue,
    monthlyData,

    //reports
    getDailyReport,
    getMonthlyReport,
    getYearlyReport,

    //coupons
    createNewCoupon,
    getCoupons,
    getEditCoupon,
    postEditCoupon,
    deleteCoupon,
}
