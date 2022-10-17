const adminHelpers = require('../helpers/admin-helpers')
const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')

const getAdminLogin = (req, res) => {
    if (req.session.adminLoginStatus) {
        res.redirect('/admin')
    } else {
        adminLoginError = req.session.adminLoginError
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.render("admin/login", { adminLoginError });
        req.session.adminLoginError = false
    }
}
const postAdminLogin = (req, res) => {
    adminHelpers.doAdminLogin(req.body).then((response) => {
        if (response.adminLoginStatus) {
            req.session.adminData = response.adminData
            res.redirect('/admin')
        } else {
            req.session.adminLoginError = response.adminLoginError
            res.redirect('/admin/login')
        }
    })
}
const getLogout = (req, res) => {
    req.session.adminLoginStatus = false
    res.redirect('/admin/login')
}
const getAdminDashboard = function (req, res, next) {
    res.render('admin/index')
}
const getProducts = (req, res) => {
    productHelpers.getAllProducts().then((products) => {
        res.render('admin/products', { products })
    })
}
const getNewProduct = (req, res) => {
    res.render('admin/new-product')
}
const postNewProduct = (req, res) => {
    productHelpers.addProduct(req, (result) => {
        res.render('admin/new-product')
    })
}
const getEditProduct = async (req, res) => {
    let productId = req.query.id
    let productDetails = await productHelpers.getProductDetails(productId);
    res.render("admin/edit-product", { productDetails });
}
const postEditProduct = (req, res) => {
    productHelpers.updateProduct(req.query.id, req.body)
        .then(() => {
            res.redirect('/admin/products')
        })
}
const getDeleteProduct = (req, res) => {
    let productId = req.query.id;
    productHelpers.deleteProduct(productId).then((response) => {
        res.redirect('/admin/products')
    })
}
const getUsers = (req, res) => {
    userHelpers.getUsers().then((users) => {
        res.render('admin/users', { users })
    })
}
const getBlockUser = (req, res) => {
    userHelpers.doBlockUser(req.query.id).then((callback) => {
        res.redirect('/admin/users')
    })
}

const getUnblockUser = (req, res) => {
    userHelpers.doUnblockUser(req.query.id).then((callback) => {
        res.redirect('/admin/users')
    })
}

const getCategories = (req,res)=>{
    productHelpers.getCategories().then((categories)=>{
        res.render('admin/categories',{categories})
    })
}
const postCategory = (req, res) => {
    productHelpers.postAddCategory(req.body).then((response) => {
        res.redirect('/admin/product-categories')
    })
}

const deleteCategory = (req,res)=>{
    let catId = req.query.id
    productHelpers.deleteCategory(catId).then((response)=>{
        res.redirect('/admin/product-categories')
    })
}

const getEditCategory = async (req, res) => {
    let catId = req.query.id
    let categoryDetails = await productHelpers.editCategory(catId);
    res.render("admin/edit-category", { categoryDetails });
}


module.exports = {
    getAdminLogin,
    postAdminLogin,
    getLogout,
    getAdminDashboard,
    getProducts,
    getNewProduct,
    postNewProduct,
    getEditProduct,
    postEditProduct,
    getDeleteProduct,
    getUsers,
    getBlockUser,
    getUnblockUser,
    getCategories,
    postCategory,
    deleteCategory,
    getEditCategory
} 