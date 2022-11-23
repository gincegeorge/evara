const adminHelpers = require('../helpers/admin-helpers')
const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')
const categoryHelpers = require('../helpers/category-helpers')
const { adminDebug, userDebug, debugDb } = require('../helpers/debug')

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
const getAdminDashboard = async function (req, res, next) {




    const productsCount = await adminHelpers.getProductsCount()
    const CategoriesCount = await adminHelpers.getCategoriesCount()
    const totalRevenue = await adminHelpers.getTotalRevenue()
    const ordersCount = await adminHelpers.getTotalOrders()
    const revenueByPaymentOption = await adminHelpers.revenueByPaymentOption()
    const monthlyRevenue = await adminHelpers.monthlyRevenue()
    let monthlyData = await adminHelpers.monthlyData()
    monthlyData.reverse()
    res.render('admin/index', { productsCount, CategoriesCount, totalRevenue, ordersCount, revenueByPaymentOption, monthlyRevenue, monthlyData })
}

const getProducts = async (req, res) => {

    userDebug(req.active)

    let products = await productHelpers.getAllProductsAdmin()
    res.render('admin/products/products', { products })

}
const getNewProduct = (req, res) => {
    productHelpers.getAllCategories().then((productCats) => {
        res.render('admin/products/new', { productCats })
    })
}
const postNewProduct = (req, res) => {
    productHelpers.addProduct(req).then(() => {
        res.redirect('/admin/products')
    }).catch((err) => {
        console.log('sdkjfhj', err);
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
const cancelOrder = async (req, res) => {
    const newOrderStatus = await adminHelpers.cancelOrder(req.body)
    res.json(newOrderStatus)
}

//CANCEL ORDER- COD
const cancelCodOrder = async (req, res) => {
    const newOrderStatus = await adminHelpers.cancelCodOrder(req.body)
    res.json(newOrderStatus)
}

//GENERATE REPORT 
const generateReport = (req, res) => {
    res.render('admin/sales/generate-report.ejs')
}

//DAILY REPORT
const dailyReport = (req, res) => {
    daterange = req.body.daterange
    adminHelpers.getDailyReport(daterange).then((productsInfo) => {
        res.render('admin/sales/sales-report', { daterange, productsInfo })
    })
}

//MONTLY REPORT
const monthlyReport = (req, res) => {
    debugDb(req.body.month)
    date = req.body.month
    adminHelpers.getMonthlyReport(date).then((productsInfo) => {
        res.render('admin/sales/monthly-report', { date, productsInfo })
    })
}

//YEARLY REPORT
const yearlyReport = (req, res) => {
    date = req.body.year
    adminHelpers.getYearlyReport(date).then((productsInfo) => {
        res.render('admin/sales/monthly-report', { date, productsInfo })
    })
}

//COUPONS
const getCoupons = async (req, res) => {
    try {
        const coupons = await adminHelpers.getCoupons()
        adminDebug(coupons)
        res.render('admin/coupon/coupons', { coupons })
    } catch (err) {
        console.log(err);
        res.redirect('/admin')
    }
}

//NEW COUPON
const newCoupon = (req, res) => {
    res.render('admin/coupon/new')
}

//POST NEW COUPON
const postNewCoupon = async (req, res) => {
    await adminHelpers.createNewCoupon(req.body)
    res.redirect('/admin/coupons')
}

//GET EDIT COUPON
const editCoupon = async (req, res) => {
    couponId = req.query.id
    try {
        const couponData = await adminHelpers.getEditCoupon(couponId)
        res.render('admin/coupon/edit', { couponData })
    } catch (err) {
        userDebug(err)
    }
}

//POST - EDIT COUPON
const postEditCoupon = async (req, res) => {
    try {
        const couponData = await adminHelpers.postEditCoupon(req.body)
        adminDebug(couponData)
        res.redirect('/admin/coupons')
    } catch (err) {
        console.log(err);
    }
}

//DELETE COUPON
const deleteCoupon = async (req, res) => {
    couponId = req.query.id
    try {
        await adminHelpers.deleteCoupon(couponId)
        res.redirect('/admin/coupons')
    } catch (err) {
        console.log(err);
        res.redirect('/admin/coupons')
    }
}

//CHANGE DARKMODE

const changeDarkMode = async (req, res) => {
    await adminHelpers.changeDarkMode(req.params.mode)
    res.json({ response: true })
}

module.exports = {
    //LOGIN
    getAdminLogin,
    postAdminLogin,
    getLogout,

    //DASHBOARD
    getAdminDashboard,
    changeDarkMode,

    //PRODUCTS
    getProducts,
    getNewProduct,
    postNewProduct,
    getEditProduct,
    postEditProduct,
    getDeleteProduct,
    deleteProductImage,

    //USERS
    getUsers,
    getBlockUser,
    getUnblockUser,

    //CATEGORIES
    getCategories,
    postCategory,
    deleteCategory,
    getEditCategory,
    putProductCategory,

    //ORDERS
    getOrders,
    viewOrder,
    OrderStatus,
    cancelOrder,
    cancelCodOrder,

    //SALES REPORT
    generateReport,
    dailyReport,
    monthlyReport,
    yearlyReport,

    //COUPONS
    getCoupons,
    newCoupon,
    postNewCoupon,
    editCoupon,
    postEditCoupon,
    deleteCoupon,
} 