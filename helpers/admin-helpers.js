var db = require('../config/connection')
var collection = require('../config/collections');
const { ORDER_COLLECTION } = require('../config/collections');
var objectId = require('mongodb').ObjectId

const doAdminLogin = (adminData) => {
    let adminCredentials = { email: 'admin@mail.com', password: '1233' };
    let response = {}
    return new Promise((resolve, reject) => {
        if (adminCredentials.email == adminData.email) {
            if (adminCredentials.password == adminData.password) {
                console.log('Credentials match');
                response.adminData = adminCredentials
                response.adminLoginStatus = true
                resolve(response)
            }
            else {
                console.log('Incorrect password');
                response.adminLoginStatus = false
                response.adminLoginError = 'Incorrect password'
                resolve(response)
            }
        } else {
            console.log('Incorrect email');
            response.adminLoginError = 'Invalid email'
            response.adminLoginStatus = false
            resolve(response)
        }
    })
}


const getAllOrders = () => {
    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).find().toArray().then((result) => {
            resolve(result)
        })
    })
}

const viewSingleOrder = (orderId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).findOne({ _id: objectId(orderId) }).then((orderDetails) => {
            resolve(orderDetails)
        })
    })
}


const changeOrderStatus = (orderDetails) => {

    const { orderId, productId, orderStatus } = orderDetails

    console.log(orderId, productId, orderStatus);

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
                resolve(result)
            })
            .catch((err) => {
                console.log(err);
            })
    })
}

module.exports = {
    doAdminLogin,
    getAllOrders,
    viewSingleOrder,
    changeOrderStatus
}
