var db = require('../config/connection')
var COLLECTION = require('../config/collections')
const { response } = require('express')
var objectId = require('mongodb').ObjectId
var slugify = require('slugify')

const addNewProduct = () => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).find().toArray()
            .then((ProductCats) => {
                resolve(ProductCats)
            })
    })
}

const addProduct = (req, callback) => {
    const files = req.files;
    let getFileNames = files.map(function (element) {
        return `${element.filename}`;
    })
    req.body.productImages = getFileNames

    if (req.body.slug === "") {
        req.body.slug = slugify(req.body.name)
    }else{
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
            productDetails.slug = slugify(productDetails.name)
        }else{
            productDetails.slug = slugify(productDetails.slug)
        }

        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).updateOne({ _id: objectId(productId) }, {
            $set: {
                name: productDetails.name,
                description: productDetails.description,
                regularPrice: productDetails.regularPrice,
                slug: productDetails.slug
            }
        }).then((response) => {
            resolve()
        })
    })
}

const deleteProduct = (productSlug) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_COLLECTION).deleteOne({slug: productSlug }).then((response) => {
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
        console.log(req);
        if (req.categorySlug === "") {
            req.categorySlug = slugify(req.categoryName)
        } else {
            req.categorySlug = slugify(req.categorySlug)
        }
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
    })
}

//edit category
const editCategory = (catId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).findOne({ _id: objectId(catId) })
            .then((categoryDetails) => {
                resolve(categoryDetails)
            })
    })
}

const updateProductCategory = (catDetails) => {
    catId = catDetails.catId
    console.log(catId)
    console.log(catDetails)
    return new Promise((resolve, reject) => {
        if (catDetails.categorySlug === "") {
            catDetails.categorySlug = slugify(catDetails.categoryName)
        } else {
            catDetails.categorySlug = slugify(catDetails.categorySlug)
        }
        db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).updateOne({ _id: objectId(catId) }, {
            $set: {
                categoryName: catDetails.categoryName,
                categorySlug: catDetails.categorySlug,
                categoryDesc: catDetails.categoryDesc
            }
        }).then((response) => {
            resolve()
        })
    })
}


module.exports = {
    addNewProduct,
    addProduct,
    getAllProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    getCategories,
    postAddCategory,
    deleteCategory,
    editCategory,
    updateProductCategory
}