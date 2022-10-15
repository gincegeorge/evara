var db = require('../config/connection')
var COLLECTION = require('../config/collections')
const { response } = require('express')
var objectId = require('mongodb').ObjectId

const addProduct = (product, callback) => {
    db.get().collection(COLLECTION.PRODUCTS_COLLECTION).insertOne(product).then((data) => {
        callback(data)
    })
}
const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        let products = db.get().collection(COLLECTION.PRODUCTS_COLLECTION).find().toArray()
        resolve(products)
    })
}
const getProductDetails = (productId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).findOne({ _id: objectId(productId) })
            .then((productDetails) => {
                resolve(productDetails)
            })
    })
}
const updateProduct = (productId, productDetails) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).updateOne({ _id: objectId(productId) }, {
            $set: {
                name: productDetails.name,
                description: productDetails.description,
                regularPrice: productDetails.regularPrice
            }
        }).then((response) => {
            resolve()
        })
    })
}

const deleteProduct = (productId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).deleteOne({ _id: objectId(productId) }).then((response) => {
            resolve(response)
        })
    })
}

module.exports = {
    addProduct,
    getAllProducts,
    getProductDetails,
    updateProduct,
    deleteProduct
}