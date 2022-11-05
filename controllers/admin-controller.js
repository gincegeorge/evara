const adminHelpers = require('../helpers/admin-helpers')
const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')
const categoryHelpers = require('../helpers/category-helpers')

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

            if (req.session.urlHistory) {
                res.redirect('/admin' + req.session.urlHistory)
                req.session.urlHistory = null
            } else {
                res.redirect('/admin')
            }
        } else {
            req.session.adminLoginError = response.adminLoginError
            res.redirect('/admin/login')
        }
    })
}
const getLogout = (req, res) => {
    req.session.adminLoginStatus = false
    req.session.adminData = null
    res.redirect('/admin/login')
}
const getAdminDashboard = function (req, res, next) {
    res.render('admin/index')
}
const getProducts = (req, res) => {
    productHelpers.getAllProducts().then((products) => {
        res.render('admin/products/products', { products })
    })
}
const getNewProduct = (req, res) => {
    productHelpers.getAllCategories().then((productCats) => {
        res.render('admin/products/new', { productCats })
    })
}
const postNewProduct = (req, res) => {
    productHelpers.addProduct(req, (result) => {
        res.redirect('/admin/products')
    })
}
const getEditProduct = async (req, res) => {
    let productSlug = req.params.productSlug
    let productDetails = await productHelpers.getProductDetails(productSlug);
    let productCats = await productHelpers.getAllCategories(productSlug)
    res.render("admin/products/edit", { productDetails, productCats });
}
const postEditProduct = (req, res) => {
    productHelpers.updateProduct(req.params.id, req)
        .then(() => {
            res.redirect('/admin/products')
        })
}
const getDeleteProduct = (req, res) => {
    let productSlug = req.params.productSlug
    productHelpers.deleteProduct(productSlug).then((response) => {
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

const getCategories = (req, res) => {
    categoryHelpers.getCategories().then((categories) => {
        res.render('admin/product-cat/categories', { categories })
    })
}
const postCategory = (req, res) => {
    categoryHelpers.postAddCategory(req.body).then((response) => {
        res.redirect('/admin/product-categories')
    })
}

const deleteCategory = (req, res) => {
    let catId = req.query.id
    categoryHelpers.deleteCategory(catId).then((response) => {
        res.redirect('/admin/product-categories')
    })
}

const getEditCategory = async (req, res) => {
    let catId = req.query.id
    let categoryDetails = await categoryHelpers.editCategory(catId);
    res.render("admin/product-cat/edit", { categoryDetails });
}

const putProductCategory = (req, res) => {
    categoryHelpers.updateProductCategory(req.body)
        .then(() => {
            res.redirect('/admin/product-categories')
        })
}

const deleteProductImage = (req, res) => {
    productHelpers.doDeleteProductImage(req.params).then((data) => {
        if (data.modifiedCount) {
            res.json({ status: true })
        } else {
            res.json({ status: false })
        }
    })
}


const getOrders = (req, res) => {
    adminHelpers.getAllOrders().then((orderList) => {
        res.render('admin/order/orders', { orderList })
    })
}

const viewOrder = async (req, res) => {
    orderId = req.params.id
    console.log(orderId);
    orderDetails = await adminHelpers.viewSingleOrder(orderId)
    res.render('admin/order/single-order', { orderDetails })
}

const OrderStatus = async (req, res) => {
    const newOrderStatus = await adminHelpers.changeOrderStatus(req.body)
    res.json(newOrderStatus)
}

//CANCEL ORDER- ONLINE PAYMENT
const cancelOrder = async(req,res)=>{
    const newOrderStatus = await adminHelpers.cancelOrder(req.body)
    res.json(newOrderStatus)
}

//CANCEL ORDER- COD
const cancelCodOrder = async(req,res)=>{
    const newOrderStatus = await adminHelpers.cancelCodOrder(req.body)
    res.json(newOrderStatus)
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
    getEditCategory,
    putProductCategory,
    deleteProductImage,
    getOrders,
    viewOrder,

    OrderStatus,

    cancelOrder,
    cancelCodOrder
} 