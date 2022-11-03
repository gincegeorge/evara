const db = require('../config/connection')
const COLLECTION = require('../config/collections')
const { response } = require('express')
const objectId = require('mongodb').ObjectId
const slugify = require('slugify')

const path = require('path');

const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)


const addProduct = (req, callback) => {
    const files = req.files;
    let getFileNames = files.map(function (element) {
        return `${element.filename}`;
    })
    req.body.productImages = getFileNames

    if (req.body.slug === "") {
        req.body.slug = slugify(req.body.name)
    } else {
        req.body.slug = slugify(req.body.slug)
    }

    db.get().collection(COLLECTION.PRODUCTS_COLLECTION).insertOne(req.body).then((data) => {
        callback(data)
    })
}

const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        let products = db.get().collection(COLLECTION.PRODUCTS_COLLECTION).find().toArray()
        resolve(products)
    })
}

const getProductDetails = (productSlug) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).findOne({ slug: productSlug })
            .then((productDetails) => {
                resolve(productDetails)
            })
    })
}

const getAllCategories = (productSlug) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).find().toArray()
            .then((ProductCats) => {
                resolve(ProductCats)
            })
    })
}

const updateProduct = (productId, req) => {
    return new Promise(async (resolve, reject) => {

        if (!req.files.length == 0) {

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

        if (productDetails.slug === "") {
            productDetails.slug = slugify(productDetails.name, { lower: true })
        } else {
            productDetails.slug = slugify(productDetails.slug)
        }
        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).updateOne({ _id: objectId(productId) }, {
            $set: {
                name: productDetails.name,
                description: productDetails.description,
                regularPrice: productDetails.regularPrice,
                slug: productDetails.slug,
                productCategories: productDetails.productCategories
            }
        }).then((response) => {
            resolve()
        })
    })
}

const deleteProduct = (productSlug) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).deleteOne({ slug: productSlug }).then((response) => {
            resolve(response)
        })
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

        resolve(datafind)
    }).catch((err) => {
        console.log("Databse error, Please buy Mangoooo" + err);
    })
}


module.exports = {
    addProduct,
    getAllProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    getAllCategories,
    doDeleteProductImage
}