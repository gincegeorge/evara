const db = require('../config/connection')
const COLLECTION = require('../config/collections')
const { response } = require('express')
const objectId = require('mongodb').ObjectId
const slugify = require('slugify')


const getCategories = () => {
    return new Promise((resolve, reject) => {
        let categories = db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).find().toArray()
        resolve(categories)
    })
}

const postAddCategory = (req, callback) => {
    return new Promise(async (resolve, reject) => {

        if (req.categorySlug === "") {
            req.categorySlug = slugify(req.categoryName, { lower: true })
        } else {
            req.categorySlug = slugify(req.categorySlug, { lower: true })
        }

        const existingCat = await db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).findOne({ categorySlug: req.categorySlug })


        if (existingCat) {
            req.categorySlug = `${req.categorySlug}-1`
            db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).insertOne(req)
                .then((data) => {
                    resolve(data)
                })
        } else {
            db.get().collection(COLLECTION.PRODUCTS_CATEGORIES_COLLECTION).insertOne(req)
                .then((data) => {
                    resolve(data)
                })
        }


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
//post edit category
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
    getCategories,
    postAddCategory,
    deleteCategory,
    editCategory,
    updateProductCategory
}
