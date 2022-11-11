var db = require('../config/connection')
var collection = require('../config/collections')
const collections = require('../config/collections')
const { render, response } = require('../app')
const { ReturnDocument } = require('mongodb')
const { CART_COLLECTION, PRODUCTS_COLLECTION, PRODUCTS_CATEGORIES_COLLECTION } = require('../config/collections')
const { adminDebug } = require('./debug')
var objectId = require('mongodb').ObjectId

const doAddToCart = (productId, userId) => {

    let productObj = {
        item: objectId(productId),
        quantity: 1
    }

    return new Promise(async (resolve, reject) => {
        let userCart = await db.get().collection(CART_COLLECTION).findOne({ user: objectId(userId) })
        if (userCart) {
            let productExists = userCart.products.findIndex(product => product.item == productId)

            console.log(productExists);

            if (productExists >= 0) {
                adminDebug('product exists')
                // db.get().collection(CART_COLLECTION)
                //     .updateOne(
                //         {
                //             user: objectId(userId),
                //             'products.item': objectId(productId)
                //         },
                //         {
                //             $inc: { 'products.$.quantity': 1 }
                //         }).then(() => {
                //             resolve()
                //         })
            } else {
                db.get().collection(CART_COLLECTION).updateOne(
                    { user: objectId(userId) },
                    { $push: { products: productObj } }
                ).then((result) => {
                    resolve(result)
                })
            }
        } else {
            let cartObj = {
                user: objectId(userId),
                products: [productObj]
            }
            db.get().collection(CART_COLLECTION).insertOne(cartObj)
                .then((response) => {
                    if (response) {
                        resolve(response)
                    } else {
                        reject()
                    }
                })
        }
    }).catch((err) => {
        console.log(err);
    })
}

const getCartProducts = (userId) => {
    return new Promise(async (resolve, reject) => {
        let cartItems = await db.get().collection(CART_COLLECTION).aggregate([
            {
                $match: { user: objectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: PRODUCTS_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            },
            {
                $lookup: {
                    from: PRODUCTS_CATEGORIES_COLLECTION,
                    localField: 'product.productCategories',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },
            {
                $project: {
                    item: 1, quantity: 1, product: 1, category: 1,
                    biggerDiscount:
                    {
                        $cond:
                        {
                            if:
                            {
                                $gt: [
                                    { $toInt: "$product.Discount" },
                                    { $toInt: '$category.categoryDiscount' }
                                ]
                            }, then: "$product.Discount", else: '$category.categoryDiscount'
                        }
                    }
                }
            },
            {
                $addFields: {
                    discountedAmount:
                    {
                        $round:
                        {
                            $divide: [
                                {
                                    $multiply: [
                                        { $toInt: "$product.regularPrice" },
                                        { $toInt: "$biggerDiscount" }
                                    ]
                                }, 100]
                        }
                    },
                }
            },
            {
                $addFields: {
                    finalPrice:
                    {
                        $round:
                        {
                            $subtract: [
                                { $toInt: "$product.regularPrice" },
                                { $toInt: "$discountedAmount" }]
                        }
                    }
                }
            },
            {
                $addFields: {
                    total: {
                        $multiply: ["$quantity", { $toInt: "$finalPrice" }],
                    }
                }
            }
        ]).toArray()
        if (cartItems) {
            resolve(cartItems)
        } else {
            reject()
        }
    }).catch((err) => {
        console.log(err);
    })
}

const getCartCount = (userId) => {
    return new Promise(async (resolve, reject) => {
        let count = 0;
        let cart = await db.get().collection(CART_COLLECTION).findOne({ user: objectId(userId) })
        if (cart) {
            count = cart.products.length
        }
        if (count) {
            resolve(count)
        } else {
            reject()
        }
    }).catch((err) => {
        console.log(err);
    })
}

const doChangeProductQuantity = (data) => {
    data.count = parseInt(data.count)
    let response = {}
    return new Promise((resolve, reject) => {
        db.get().collection(CART_COLLECTION)
            .updateOne(
                {
                    _id: objectId(data.cart),
                    'products.item': objectId(data.product)
                },
                {
                    $inc: { 'products.$.quantity': data.count }
                })
            .then(() => {
                response.status = true
                if (response) {
                    resolve(response)
                } else {
                    reject()
                }
            })
    }).catch((err) => {
        console.log(err);
    })
}

const doDeleteProductFromCart = (data) => {
    return new Promise((resolve, reject) => {
        db.get().collection(CART_COLLECTION).updateOne(
            { _id: objectId(data.cart) },
            { $pull: { products: { item: objectId(data.product) } } }
        ).then((response) => {
            if (response) {
                resolve({ productRemoved: true })
            } else {
                reject()
            }
        })
    }).catch((err) => {
        console.log(err);
    })
}


module.exports = {
    doAddToCart,
    getCartProducts,
    getCartCount,
    doChangeProductQuantity,
    doDeleteProductFromCart
}