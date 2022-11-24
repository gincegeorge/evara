/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable no-return-await */
/* eslint-disable max-len */

const objectId = require('mongodb').ObjectId;
const db = require('../config/connection');
const {
  // eslint-disable-next-line max-len
  ORDER_COLLECTION, PRODUCTS_COLLECTION, PRODUCTS_CATEGORIES_COLLECTION, COUPON_COLLECTION, ADMIN_COLLECTION,
} = require('../config/collections');
const { adminDebug } = require('./debug');

const doAdminLogin = (adminData) => {
  const adminCredentials = { email: 'admin@mail.com', password: '1233' };
  const response = {};
  return new Promise((resolve, reject) => {
    if (adminCredentials.email === adminData.email) {
      if (adminCredentials.password === adminData.password) {
        console.log('Credentials match');
        response.adminData = adminCredentials;
        response.adminLoginStatus = true;
        if (response) {
          resolve(response);
        } else {
          reject();
        }
      } else {
        console.log('Incorrect password');
        response.adminLoginStatus = false;
        response.adminLoginError = 'Incorrect password';
        if (response) {
          resolve(response);
        } else {
          reject();
        }
      }
    } else {
      console.log('Incorrect email');
      response.adminLoginError = 'Invalid email';
      response.adminLoginStatus = false;
      if (response) {
        resolve(response);
      } else {
        reject();
      }
    }
  }).catch((err) => {
    console.log(err);
  });
};

const getAllOrders = () => new Promise((resolve, reject) => {
  db.get().collection(ORDER_COLLECTION).find().sort({ date: -1 })
    .toArray()
    .then((result) => {
      if (result) {
        resolve(result);
      } else {
        reject();
      }
    });
}).catch((err) => {
  console.log(err);
});

const viewSingleOrder = (orderId) => new Promise((resolve, reject) => {
  db.get().collection(ORDER_COLLECTION).findOne({ _id: objectId(orderId) }).then((orderDetails) => {
    if (orderDetails) {
      resolve(orderDetails);
    } else {
      reject();
    }
  });
}).catch((err) => {
  console.log(err);
});

const changeOrderStatus = (orderDetails) => {
  const { orderId, productId, orderStatus } = orderDetails;

  if (orderStatus === 'Delivered') {
    return new Promise((resolve, reject) => {
      db.get().collection(ORDER_COLLECTION)
        .updateOne(
          {
            _id: objectId(orderId),
            'products.item': objectId(productId),
          },
          {
            $set: { 'products.$.productOrderStatus': orderStatus, 'products.$.productpaymentStatus': 'Success' },
          },
        )

        .then((result) => {
          if (result) {
            resolve(result);
          } else {
            reject();
          }
        });
    }).catch((err) => {
      console.log(err);
    });
  }
  return new Promise((resolve, reject) => {
    db.get().collection(ORDER_COLLECTION)
      .updateOne(
        {
          _id: objectId(orderId),
          'products.item': objectId(productId),
        },
        {
          $set: { 'products.$.productOrderStatus': orderStatus },
        },
      )

      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject();
        }
      });
  }).catch((err) => {
    console.log(err);
  });
};

// CANCEL ORDER - ONLINE PAYMENT
const cancelOrder = (orderDetails) => {
  const {
    orderId, productId, newOrderStatus, paymentStatus,
  } = orderDetails;

  return new Promise((resolve, reject) => {
    db.get().collection(ORDER_COLLECTION)

      .updateOne(
        {
          _id: objectId(orderId),
          'products.item': objectId(productId),
        },
        {
          $set: { 'products.$.productOrderStatus': newOrderStatus, 'products.$.productpaymentStatus': paymentStatus },
        },
      )

      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject();
        }
      });
  }).catch((err) => {
    console.log(err);
  });
};

// CANCEL ORDER - COD
const cancelCodOrder = (orderDetails) => {
  const { orderId, productId, newOrderStatus } = orderDetails;

  return new Promise((resolve, reject) => {
    db.get().collection(ORDER_COLLECTION)

      .updateOne(
        {
          _id: objectId(orderId),
          'products.item': objectId(productId),
        },
        {
          $set: { 'products.$.productOrderStatus': newOrderStatus },
        },
      )

      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject();
        }
      });
  }).catch((err) => {
    console.log(err);
  });
};

// GET PRODUCTS COUNT
const getProductsCount = async () => new Promise((resolve, reject) => {
  db.get().collection(PRODUCTS_COLLECTION).count()
    .then((result) => {
      if (result) {
        resolve(result);
      } else {
        reject();
      }
    });
}).catch((err) => {
  console.log(err);
});

// GET CATEGORIES COUNT
const getCategoriesCount = () => new Promise((resolve, reject) => {
  db.get().collection(PRODUCTS_CATEGORIES_COLLECTION).count()
    .then((result) => {
      if (result) {
        resolve(result);
      } else {
        reject();
      }
    });
}).catch((err) => {
  console.log(err);
});

// GET TOTAL REVENUE
const getTotalRevenue = async () => new Promise((resolve, reject) => {
  db.get().collection(ORDER_COLLECTION).aggregate([
    {
      $match: { orderPlaced: true },
    },
    {
      $group: {
        _id: 'orderPlaced',
        revenue: { $sum: '$cartTotal' },
      },
    },
    {
      $project: {
        _id: 0, revenue: 1,
      },
    },
  ]).toArray()
    .then((result) => {
      if (result) {
        resolve(result[0]);
      } else {
        reject();
      }
    });
}).catch((err) => {
  console.log(err);
});

// GET TOTAL NUMBER OF ORDERS
const getTotalOrders = () => new Promise((resolve, reject) => {
  db.get().collection(ORDER_COLLECTION).count()
    .then((result) => {
      if (result) {
        resolve(result);
      } else {
        reject();
      }
    });
})
  .catch((err) => {
    console.log(err);
  });

// TOTAL REVENUE BY CATEGORY
const revenueByPaymentOption = () => new Promise((resolve, reject) => {
  const d = new Date();
  const month = d.getMonth();
  const year = d.getFullYear();

  const oneMonthBefore = `${year}-${month}`;

  db.get().collection(ORDER_COLLECTION).aggregate([
    {
      $match: { orderPlaced: true, date: { $gte: new Date(oneMonthBefore) } },
    },
    {
      $group: {
        _id: '$paymentOption',
        revenue: { $sum: '$cartTotal' },
      },
    },
    {
      $sort: {
        revenue: 1,
      },
    },
  ]).toArray()
    .then((result) => {
      if (result) {
        resolve(result);
      } else {
        reject();
      }
    });
}).catch((err) => {
  console.log(err);
});

// MONTHLY REVENUE
const monthlyRevenue = () => {
  const d = new Date();
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  const oneMonthBefore = `${year}-${month}-${day}`;

  return new Promise((resolve, reject) => {
    db.get().collection(ORDER_COLLECTION).aggregate([
      {
        $match: { orderPlaced: true, date: { $gte: new Date(oneMonthBefore) } },
      },
      {
        $group: {
          _id: 'orderPlaced',
          revenue: { $sum: '$cartTotal' },
        },
      },
      {
        $project: {
          _id: 0, revenue: 1,
        },
      },
    ]).toArray()
      .then((result) => {
        if (result) {
          resolve(result[0]);
        } else {
          reject();
        }
      });
  }).catch((err) => {
    console.log(err);
  });
};

// GET LINECHART
const monthlyData = () => new Promise((resolve, reject) => {
  db.get().collection(ORDER_COLLECTION).aggregate([
    {
      $match: { orderPlaced: true },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        revenue: { $sum: '$cartTotal' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $limit: 7,
    },
  ]).toArray()
    .then((result) => {
      if (result) {
        resolve(result);
      } else {
        reject();
      }
    });
}).catch((err) => {
  console.log(err);
});

// GET DAILY REPORT
const getDailyReport = (dateRange) => {
  let [startDate, endDate] = dateRange.split(' - ');

  startDate += 'T00:00:00';
  endDate += 'T23:59:59';

  adminDebug(startDate);
  adminDebug(endDate);

  return new Promise((resolve, reject) => {
    db.get().collection(ORDER_COLLECTION).aggregate([
      {
        $match: { date: { $gte: new Date(startDate), $lte: new Date(endDate) }, orderPlaced: true },
      },
      {
        $project: {
          _id: 0, cartTotal: 1, paymentOption: 1, orderId: 1, products: 1,
        },
      },
    ]).toArray()
      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject();
        }
      });
  }).catch((err) => {
    console.log(err);
  });
};

// GET MONTHLY REPORT
const getMonthlyReport = (monthAndYear) => {
  // Create end date of the month
  const [year, month] = monthAndYear.toString().split('-');
  const d = new Date(year, month, 0);
  const day = d.toString().split(' ')[2];

  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-${day}`;

  return new Promise((resolve, reject) => {
    db.get().collection(ORDER_COLLECTION).aggregate([
      {
        $match: { date: { $gte: new Date(startDate), $lte: new Date(endDate) }, orderPlaced: true },
      },
      {
        $project: {
          _id: 0, cartTotal: 1, paymentOption: 1, orderId: 1, products: 1,
        },
      },
    ]).toArray()
      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject();
        }
      });
  }).catch((err) => {
    console.log(err);
  });
};

// YEARLY REPORT
const getYearlyReport = (year) => {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  return new Promise((resolve, reject) => {
    db.get().collection(ORDER_COLLECTION).aggregate([
      {
        $match: { date: { $gte: new Date(startDate), $lte: new Date(endDate) }, orderPlaced: true },
      },
      {
        $project: {
          _id: 0, cartTotal: 1, paymentOption: 1, orderId: 1, products: 1,
        },
      },
    ]).toArray()
      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject();
        }
      });
  }).catch((err) => {
    console.log(err);
  });
};

// NEW COUPON
const createNewCoupon = (couponData) => {
  // eslint-disable-next-line no-param-reassign
  couponData.date = new Date();

  return new Promise((resolve, reject) => {
    db.get().collection(COUPON_COLLECTION).insertOne(couponData)
      .then((response) => {
        if (response) {
          resolve(response);
        } else {
          reject();
        }
      });
  }).catch((err) => {
    adminDebug(err);
  });
};

// GET COUPONS
const getCoupons = async () => await db.get().collection(COUPON_COLLECTION).find().sort({ expiryDate: -1 })
  .toArray();

// EDIT COUPON
const getEditCoupon = async (couponId) => await db.get().collection(COUPON_COLLECTION).findOne({ _id: objectId(couponId) });

// POST EDIT COUPON
const postEditCoupon = async (couponDetails) => {
  const couponId = couponDetails.id;
  return await db.get().collection(COUPON_COLLECTION).updateOne(
    { _id: objectId(couponId) },
    {
      $set: {
        couponCode: couponDetails.couponCode,
        couponDiscount: couponDetails.couponDiscount,
        expiryDate: couponDetails.expiryDate,
        couponMaxDiscount: couponDetails.couponMaxDiscount,
        couponMinCartValue: couponDetails.couponMinCartValue,
      },
    },
  );
};

// DELETE COUPON
const deleteCoupon = async (couponId) => {
  await db.get().collection(COUPON_COLLECTION).deleteOne(
    { _id: objectId(couponId) },
  );
};

const changeDarkMode = async (mode) => {
  try {
    return db.get().collection(ADMIN_COLLECTION).updateOne({ username: 'admin@gmail.com' }, { $set: { theme: mode } });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  // login
  doAdminLogin,
  getAllOrders,
  viewSingleOrder,

  // order status
  changeOrderStatus,
  cancelOrder,
  cancelCodOrder,

  // dashboard
  changeDarkMode,
  getProductsCount,
  getCategoriesCount,
  getTotalRevenue,
  getTotalOrders,
  revenueByPaymentOption,
  monthlyRevenue,
  monthlyData,

  // reports
  getDailyReport,
  getMonthlyReport,
  getYearlyReport,

  // coupons
  createNewCoupon,
  getCoupons,
  getEditCoupon,
  postEditCoupon,
  deleteCoupon,
};
