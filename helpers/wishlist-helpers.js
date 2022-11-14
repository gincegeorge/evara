var db = require('../config/connection')
const { CART_COLLECTION, PRODUCTS_COLLECTION, PRODUCTS_CATEGORIES_COLLECTION, WISHLIST_COLLECTION } = require('../config/collections')
const { adminDebug, userDebug, debugDb } = require('./debug')
var objectId = require('mongodb').ObjectId

//WISHLIST PAGE
const getWishlist = (userId) => {
    return new Promise(async (resolve, reject) => {
        let wishlistedProducts = await db.get().collection(WISHLIST_COLLECTION).aggregate([
            {
                $match: { user: objectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
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
                    item: 1, product: { $arrayElemAt: ['$product', 0] }
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
                    item: 1, product: 1, category: 1,
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
            // {
            //     $addFields: {
            //         total: {
            //             $multiply: ["$quantity", { $toInt: "$finalPrice" }],
            //         }
            //     }
            // }
        ]).toArray()
        if (wishlistedProducts) {
            resolve(wishlistedProducts)
        } else {
            reject()
        }
    }).catch((err) => {
        console.log(err);
    })
}

//ADD TO WISHLIST 
const addToWishlist = (productId, userId) => {

    let productObj = {
        item: objectId(productId)
    }

    return new Promise(async (resolve, reject) => {
        let userWishlist = await db.get().collection(WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
        if (userWishlist) {

            let productExists = userWishlist.products.findIndex(product => product.item == productId)

            console.log(productExists);

            if (productExists >= 0) {
                adminDebug('product exists')
            } else {
                db.get().collection(WISHLIST_COLLECTION).updateOne(
                    { user: objectId(userId) },
                    { $push: { products: productObj } }
                ).then((result) => {
                    resolve(result)
                })
            }
        } else {
            let wishlistObj = {
                user: objectId(userId),
                products: [productObj]
            }
            db.get().collection(WISHLIST_COLLECTION).insertOne(wishlistObj)
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


//REMOVE FROM WISHLIST
const deleteProductFromWishlist = (userId, productId) => {
    debugDb(userId, productId)
    return new Promise((resolve, reject) => {
        db.get().collection(WISHLIST_COLLECTION).updateOne(
            { user: objectId(userId) },
            { $pull: { products: { item: objectId(productId) } } }
        ).then((response) => {
            if (response) {
                userDebug(response)
                resolve({ productRemoved: true })
            } else {
                reject()
            }
        })
    }).catch((err) => {
        console.log(err);
    })
}

//GET WISHLIST COUNT
const getWishlistCount = async (userId) => {
    return await db.get().collection(WISHLIST_COLLECTION).findOne({ user: objectId(userId) }, { _id: 0, products: 1 })
}

//ADD TO CART FROM WISHLIST
const addToCartFromWishlist = (productId, userId) => {

    let productObj = {
        item: objectId(productId),
        quantity: 1
    }

    return new Promise(async (resolve, reject) => {

        response = {}

        let userCart = await db.get().collection(CART_COLLECTION).findOne({ user: objectId(userId) })
        if (userCart) {
            let productExists = userCart.products.findIndex(product => product.item == productId)

            console.log(productExists);

            if (productExists >= 0) {
                adminDebug('product exists')
                response.productExists = true
                resolve(response)
            } else {
                db.get().collection(CART_COLLECTION).updateOne(
                    { user: objectId(userId) },
                    { $push: { products: productObj } }
                ).then((response) => {
                    response.productAddedToCart = true
                    resolve(response)
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
                        response.productAddedToCart = true
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


module.exports = {
    getWishlist,
    addToWishlist,
    deleteProductFromWishlist,
    getWishlistCount,
    addToCartFromWishlist,
}