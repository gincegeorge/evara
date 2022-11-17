const db = require('../config/connection')
const COLLECTION = require('../config/collections')
const { response } = require('express')
const objectId = require('mongodb').ObjectId
const slugify = require('slugify')
const path = require('path');
const fs = require('fs')
const { promisify } = require('util')
// const { resolve } = require('path')
const { adminDebug, debugDb, userDebug } = require('./debug')
const { PRODUCTS_COLLECTION, PRODUCTS_CATEGORIES_COLLECTION } = require('../config/collections')
const unlinkAsync = promisify(fs.unlink)


const addProduct = (req) => {

    return new Promise(async (resolve, reject) => {

        //changing file names
        const files = req.files;
        let getFileNames = files.map(function (element) {
            return `${element.filename}`;
        })
        req.body.productImages = getFileNames

        //slug creation
        if (req.body.slug === "") {
            req.body.slug = slugify(req.body.name, { lower: true })
        } else {
            req.body.slug = slugify(req.body.slug, { lower: true })
        }

        //product created date
        req.body.date = new Date()
        req.body.productCategories = objectId(req.body.productCategories)

        //calculating sale price
        let discountAmount = (req.body.regularPrice * req.body.Discount) / 100
        let salePrice = Math.round(req.body.regularPrice - discountAmount)
        req.body.salePrice = salePrice

        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).insertOne(req.body).then((data) => {
            if (data) {
                resolve(data)
            } else {
                reject()
            }

        })
    }).catch((err) => {
        console.log(err);
    })

}

// const getAllProductsAdmin = () => {
//     return new Promise(async (resolve, reject) => {
//         let products = db.get().collection(COLLECTION.PRODUCTS_COLLECTION).find().sort({ 'date': -1 }).toArray()

//         adminDebug(products)

//         if (products) {
//             resolve(products)
//         } else {
//             reject()
//         }
//     }).catch((err) => {
//         console.log(err);
//     })
// }

const getAllProducts = async (startIndex, limit) => {


    userDebug(startIndex, limit)
    try {
        return await db.get().collection(PRODUCTS_COLLECTION).aggregate([
            {
                $lookup: {
                    from: PRODUCTS_CATEGORIES_COLLECTION,
                    localField: 'productCategories',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },
            {
                $project: {
                    _id: 1, name: 1, slug: 1, regularPrice: 1, Stock: 1, Discount: 1, salePrice: 1, productImages: 1, category: 1, date: 1,
                    biggerDiscount:
                    {
                        $cond:
                        {
                            if:
                            {
                                $gt: [
                                    { $toInt: "$Discount" },
                                    { $toInt: '$category.categoryDiscount' }
                                ]
                            }, then: "$Discount", else: '$category.categoryDiscount'
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
                                        { $toInt: "$regularPrice" },
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
                                { $toInt: "$regularPrice" },
                                { $toInt: "$discountedAmount" }]
                        }
                    }
                }
            },
            {
                $sort: {
                    date: -1
                }
            },
            {
                $skip: startIndex
            },
            {
                $limit: limit
            },

        ]).toArray()
    } catch (error) {
        console.log(error);
    }
}

//get all products in admin side
const getAllProductsAdmin = async () => {

    try {
        return await db.get().collection(PRODUCTS_COLLECTION).aggregate([
            {
                $lookup: {
                    from: PRODUCTS_CATEGORIES_COLLECTION,
                    localField: 'productCategories',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },
            {
                $project: {
                    _id: 1, name: 1, slug: 1, regularPrice: 1, Stock: 1, Discount: 1, salePrice: 1, productImages: 1, category: 1, date: 1,
                    biggerDiscount:
                    {
                        $cond:
                        {
                            if:
                            {
                                $gt: [
                                    { $toInt: "$Discount" },
                                    { $toInt: '$category.categoryDiscount' }
                                ]
                            }, then: "$Discount", else: '$category.categoryDiscount'
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
                                        { $toInt: "$regularPrice" },
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
                                { $toInt: "$regularPrice" },
                                { $toInt: "$discountedAmount" }]
                        }
                    }
                }
            },
            {
                $sort: {
                    date: -1
                }
            }

        ]).toArray()
    } catch (error) {
        console.log(error);
    }
}

const getNewForShopPage = async () => {
    try {

        return await db.get().collection(PRODUCTS_COLLECTION).aggregate([
            {
                $lookup: {
                    from: PRODUCTS_CATEGORIES_COLLECTION,
                    localField: 'productCategories',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },
            {
                $project: {
                    _id: 1, name: 1, slug: 1, regularPrice: 1, Stock: 1, Discount: 1, salePrice: 1, productImages: 1, category: 1, date: 1,
                    biggerDiscount:
                    {
                        $cond:
                        {
                            if:
                            {
                                $gt: [
                                    { $toInt: "$Discount" },
                                    { $toInt: '$category.categoryDiscount' }
                                ]
                            }, then: "$Discount", else: '$category.categoryDiscount'
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
                                        { $toInt: "$regularPrice" },
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
                                { $toInt: "$regularPrice" },
                                { $toInt: "$discountedAmount" }]
                        }
                    }
                }
            },
            {
                $sort: {
                    date: -1
                }
            },
            {
                $limit: 3
            }
        ]).toArray()
    }
    catch (error) {
        console.log(error);
    }
}

const getProductDetails = (productSlug) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).findOne({ slug: productSlug })
            .then((productDetails) => {
                if (productDetails) {
                    resolve(productDetails)
                } else {
                    reject()
                }
            })
    }).catch((err) => {
        console.log(err);
    })
}

const getAllCategories = (productSlug) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).find().toArray()
            .then((ProductCats) => {
                if (ProductCats) {
                    resolve(ProductCats)
                } else {
                    reject()
                }
            })
    }).catch((err) => {
        console.log(err);
    })
}

const updateProduct = (productId, req) => {
    return new Promise(async (resolve, reject) => {

        if (!req.files.length == 0) {

            //changing file names
            const files = req.files;
            let getFileNames = files.map(function (element) {
                return `${element.filename}`;
            })

            req.body.productImages = getFileNames

            let productDetails = req.body

            await db.get().collection(COLLECTION.PRODUCTS_COLLECTION).updateMany(
                { _id: objectId(productId) },
                {
                    $push: {
                        productImages: {
                            $each: productDetails.productImages
                        }
                    }
                }
            )
        }
        let productDetails = req.body

        //creating slug
        if (productDetails.slug === "") {
            productDetails.slug = slugify(productDetails.name, { lower: true })
        } else {
            productDetails.slug = slugify(productDetails.slug, { lower: true })
        }

        //calculating sale price
        let discountAmount = (productDetails.regularPrice * productDetails.Discount) / 100
        productDetails.salePrice = Math.round(productDetails.regularPrice - discountAmount)

        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).updateOne({ _id: objectId(productId) }, {
            $set: {
                name: productDetails.name,
                description: productDetails.description,
                regularPrice: productDetails.regularPrice,
                Discount: productDetails.Discount,
                slug: productDetails.slug,
                productCategories: objectId(productDetails.productCategories),
                salePrice: productDetails.salePrice,
                Stock: productDetails.Stock
            }
        }).then((response) => {
            if (response) {
                resolve()
            }
            else {
                reject()
            }
        })
    }).catch((err) => {
        console.log(err);
    })
}

const deleteProduct = (productSlug) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).deleteOne({ slug: productSlug }).then((response) => {
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


const doDeleteProductImage = (data) => {
    return new Promise(async (resolve, reject) => {

        const { prodId, imgName } = data

        const datafind = await db.get().collection(COLLECTION.PRODUCTS_COLLECTION).updateOne(
            { _id: objectId(prodId) },
            {
                $pull: { productImages: imgName }
            }
        )

        // Delete the file like normal
        if (datafind.modifiedCount) {
            imgPath = 'public/products-uploads/' + imgName
            await unlinkAsync(imgPath)
        }

        if (datafind) {
            resolve(datafind)
        } else {
            reject()
        }

    }).catch((err) => {
        console.log(err);
    })
}

const productsInCategory = (categorySlug, startIndex, limit) => {

    return new Promise(async (resolve, reject) => {

        let products = await db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).aggregate([
            {
                $match: { categorySlug: categorySlug }
            },
            {
                $project: { _id: 1, categoryDiscount: 1, categoryName: 1, categoryDesc: 1 }
            },
            {
                $lookup: {
                    from: PRODUCTS_COLLECTION,
                    localField: '_id',
                    foreignField: 'productCategories',
                    as: 'productsInCat'
                }
            },
            {
                $unwind: '$productsInCat'
            },
            {
                $project: {
                    _id: 1, categoryDiscount: 1, categoryName: 1, categoryDesc: 1, productsInCat: 1,
                    biggerDiscount:
                    {
                        $cond:
                        {
                            if:
                            {
                                $gt: [
                                    { $toInt: "$categoryDiscount" },
                                    { $toInt: '$productsInCat.Discount' }
                                ]
                            }, then: "$categoryDiscount", else: '$productsInCat.Discount'
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
                                        { $toInt: "$productsInCat.regularPrice" },
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
                                { $toInt: "$productsInCat.regularPrice" },
                                { $toInt: "$discountedAmount" }]
                        }
                    }
                }
            },
            {
                $sort: {
                    date: -1
                }
            },
            {
                $skip: startIndex
            },
            {
                $limit: limit
            },
        ]).toArray()
        if (products) {
            resolve(products)
        } else {
            reject()
        }
    }).catch((err) => {
        console.log(err);
    })
}

const productsInCategoryCount = async (categorySlug) => {
    try {
        return await db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).aggregate([
            {
                $match: { categorySlug: categorySlug }
            },
            {
                $project: { _id: 1 }
            },
            {
                $lookup: {
                    from: PRODUCTS_COLLECTION,
                    localField: '_id',
                    foreignField: 'productCategories',
                    as: 'productsInCat'
                }
            },
            {
                $unwind: '$productsInCat'
            },
            {
                $project: {
                    _id: 1, productsInCat: 1
                }
            }
        ]).toArray()
    } catch (error) {
        console.log(error);
    }
}

const getNewProducts = async (categorySlug) => {
    try {

        return await db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).aggregate([
            {
                $match: { categorySlug: categorySlug }
            },
            {
                $project: { _id: 1, categoryDiscount: 1, categoryName: 1, categoryDesc: 1 }
            },
            {
                $lookup: {
                    from: PRODUCTS_COLLECTION,
                    localField: '_id',
                    foreignField: 'productCategories',
                    as: 'productsInCat'
                }
            },
            {
                $unwind: '$productsInCat'
            },
            {
                $project: {
                    _id: 1, categoryDiscount: 1, categoryName: 1, categoryDesc: 1, productsInCat: 1,
                    biggerDiscount:
                    {
                        $cond:
                        {
                            if:
                            {
                                $gt: [
                                    { $toInt: "$categoryDiscount" },
                                    { $toInt: '$productsInCat.Discount' }
                                ]
                            }, then: "$categoryDiscount", else: '$productsInCat.Discount'
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
                                        { $toInt: "$productsInCat.regularPrice" },
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
                                { $toInt: "$productsInCat.regularPrice" },
                                { $toInt: "$discountedAmount" }]
                        }
                    }
                }
            },
            {
                $sort: {
                    date: -1
                }
            }, {
                $limit: 3
            }
        ]).toArray()
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    addProduct,
    getAllProducts,
    getAllProductsAdmin,
    getNewForShopPage,
    getProductDetails,
    updateProduct,
    deleteProduct,
    getAllCategories,
    doDeleteProductImage,

    productsInCategory,
    productsInCategoryCount,
    getNewProducts,
}