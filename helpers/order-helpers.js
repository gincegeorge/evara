var db = require('../config/connection')
var collection = require('../config/collections')
const collections = require('../config/collections')
const { render, response } = require('../app')
const { ReturnDocument } = require('mongodb')
const { CART_COLLECTION, PRODUCTS_COLLECTION, USERS_COLLECTION, ORDER_COLLECTION } = require('../config/collections')
var objectId = require('mongodb').ObjectId
const cartHelpers = require('../helpers/cart-helpers')
const userHelpers = require('../helpers/user-helpers')
const { v4: uuidv4 } = require('uuid')






const getCheckoutData = (userId) => {
    return new Promise(async (resolve, reject) => {
        let cartTotal = await db.get().collection(CART_COLLECTION).aggregate([
            {
                $match: { user: objectId(userId) }
                // matched cart from database using user id
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                    // projected item and qty as per user cart
                }
            },
            {
                $lookup: {
                    from: PRODUCTS_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                    // brings up product details from product collection
                }
            },
            {
                $project: {
                    item: 1,
                    quantity: 1,
                    product: {
                        $arrayElemAt: ['$product', 0]
                    }
                    // projected the product details
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $multiply: [
                                { $toInt: "$quantity" },
                                { $toInt: "$product.regularPrice" },
                            ],
                        },
                    },
                },
            }
        ]).toArray()
        if (cartTotal.length !== 0) {
            resolve(cartTotal[0].total)
        } else {
            resolve('0')
        }

    })
}

const getDeliveryAddress = (addressId, userId) => {
    return new Promise(async (resolve, reject) => {

        await db
            .get()
            .collection(USERS_COLLECTION)
            .aggregate([
                {
                    $match: { _id: objectId(userId) },
                },
                {
                    $unwind: { path: "$address" },
                },
                {
                    $match: { "address._id": { $in: [objectId(addressId)] } }
                }
                ,
                {
                    $project: { address: 1, _id: 0 }
                }
            ])
            .toArray()

            .then((result) => {
                resolve(result[0].address)
            })
    })
}

/************************************* */
//            NEW ORDER
/************************************* */
const newOrder = async (orderDetails) => {

    const userId = user._id
    const cartTotal = await getCheckoutData(user._id)
    const products = await cartHelpers.getCartProducts(user._id)
    const deliveryAddress = await getDeliveryAddress(orderDetails.address, user._id)
    const paymentOption = orderDetails.paymentOption

    const orderStatus = orderDetails.paymentOption === 'COD' ? 'Processing' : 'Pending'
    const paymentStatus = orderDetails.paymentOption === 'COD' ? 'Pending' : 'on-hold'

    for (let i in products) {
        products[i].productOrderStatus = orderStatus
    }

    let orderObj = {
        userId: objectId(userId),
        products,
        cartTotal,
        deliveryAddress,
        paymentOption,
        paymentStatus,
        orderStatus,
        date: new Date(),
        orderId: 'EVARA' + uuidv4().toString().substring(0, 5)
    }

    return new Promise((resolve, reject) => {
        db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj)
            .then((result) => {

                //clearing cart
                db.get().collection(CART_COLLECTION).deleteOne({ user: objectId(userId) })

                result.paymentOption = paymentOption
                result.cartTotal = cartTotal

                resolve(result)

                // if (paymentOption === 'COD') {
                //     result.orderStatus = orderStatus
                //     resolve(result)
                // } else if (paymentOption === 'razorPay') {
                //     result.orderStatus = orderStatus
                //     userHelpers.generateRazorpay(result.insertedId, cartTotal).then((response) => {
                //         console.log(response);
                //         resolve(response)
                //     })
                // }


            })
    })
}

const getAllOrders = (userId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(ORDER_COLLECTION).find({ userId: objectId(userId) }, {}).sort({ 'date': -1 }).toArray()
            .then((result) => {
                resolve(result)
            })
    })
}


//CHANGE ORDER STATUS
const changeOrderStatus = (orderDetails) => {

    console.log(orderDetails);

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
                resolve(result)
            })
            .catch((err) => {
                console.log(err);
            })


    })

}
//TODO ask about naming convension of controller and helpers 


module.exports = {
    getCheckoutData,
    getDeliveryAddress,
    newOrder,
    getAllOrders,
    changeOrderStatus
}
