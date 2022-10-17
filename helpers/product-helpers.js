var db = require('../config/connection')
var COLLECTION = require('../config/collections')
const { response } = require('express')
var objectId = require('mongodb').ObjectId

const addProduct = (req, callback) => {

    const files = req.files;

    let getFileNames = files.map(function (element) {
        return `${element.filename}`;
    })

    req.body.productImages = getFileNames

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

const getCategories = () => {
    return new Promise((resolve, reject) => {
        let categories = db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).find().toArray()
        resolve(categories)
    })
}

const postAddCategory = (req, callback) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).insertOne(req)
            .then((data) => {
                resolve(data)
            })
    })
}

const deleteCategory = (catId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).deleteOne({ _id: objectId(catId) }).then((response) => {
            resolve(response)
        })
        .catch((reject) => {
             console.log(reject);
        })
    })
}

//edit category
const editCategory = (catId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).findOne({ _id: objectId(catId) })
            .then((categoryDetails) => {
                console.log(catId);
                console.log('------+++++---------');
                resolve(categoryDetails)
            })
    })
}


module.exports = {
    addProduct,
    getAllProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    getCategories,
    postAddCategory,
    deleteCategory,
    editCategory
}