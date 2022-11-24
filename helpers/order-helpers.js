/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
const objectId = require('mongodb').ObjectId;
const { v4: uuidv4 } = require('uuid');
const db = require('../config/connection');
const collections = require('../config/collections');
const {
  CART_COLLECTION, PRODUCTS_COLLECTION, USERS_COLLECTION, ORDER_COLLECTION, PRODUCTS_CATEGORIES_COLLECTION, COUPON_COLLECTION,
} = require('../config/collections');
const cartHelpers = require('./cart-helpers');
const { userDebug } = require('./debug');

const getCheckoutData = (userId) => new Promise(async (resolve, reject) => {
  const cartTotal = await db.get().collection(CART_COLLECTION).aggregate([
    {
      $match: { user: objectId(userId) },
    },
    {
      $unwind: '$products',
    },
    {
      $project: {
        item: '$products.item',
        quantity: '$products.quantity',
      },
    },
    {
      $lookup: {
        from: PRODUCTS_COLLECTION,
        localField: 'item',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $project: {
        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] },
      },
    },
    {
      $lookup: {
        from: PRODUCTS_CATEGORIES_COLLECTION,
        localField: 'product.productCategories',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: '$category',
    },
    {
      $project: {
        item: 1,
        quantity: 1,
        product: 1,
        category: 1,
        biggerDiscount:
                    {
                      $cond:
                        {
                          if:
                            {
                              $gt: [
                                { $toInt: '$product.Discount' },
                                { $toInt: '$category.categoryDiscount' },
                              ],
                            },
                          then: '$product.Discount',
                          else: '$category.categoryDiscount',
                        },
                    },
      },
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
                                { $toInt: '$product.regularPrice' },
                                { $toInt: '$biggerDiscount' },
                              ],
                            }, 100],
                        },
                    },
      },
    },
    {
      $addFields: {
        finalPrice:
                    {
                      $round:
                        {
                          $subtract: [
                            { $toInt: '$product.regularPrice' },
                            { $toInt: '$discountedAmount' }],
                        },
                    },
      },
    },
    {
      $addFields: {
        total: {
          $multiply: ['$quantity', { $toInt: '$finalPrice' }],
        },
      },
    },
    {
      $project: {
        _id: 1, total: 1,
      },
    },
    {
      $group: {
        _id: '$_id',
        cartTotal: {
          $sum: '$total',
        },
      },
    },
  ]).toArray();
  userDebug('================================')
  if (cartTotal.length !== 0) {
    const couponInfo = await cartHelpers.getCartCouponInfo(user._id);

    if (couponInfo.couponApplied) {
      priceAfterCoupon = (cartTotal[0].cartTotal) - (couponInfo.couponDiscount);
      resolve(priceAfterCoupon);
    } else {
      resolve(cartTotal[0].cartTotal);
    }
  } else {
    resolve('0');
  }
}).catch((err) => {
  console.log(err);
});

const getDeliveryAddress = (addressId, userId) => new Promise(async (resolve, reject) => {
  await db
    .get()
    .collection(USERS_COLLECTION)
    .aggregate([
      {
        $match: { _id: objectId(userId) },
      },
      {
        $unwind: { path: '$address' },
      },
      {
        $match: { 'address._id': { $in: [objectId(addressId)] } },
      },
      {
        $project: { address: 1, _id: 0 },
      },
    ])
    .toArray()

    .then((result) => {
      if (result.length) {
        resolve(result[0].address);
      } else {
        reject();
      }
    });
}).catch((err) => {
  console.log(err);
});

/** *********************************** */
//            NEW ORDER
/** *********************************** */
const newOrder = async (orderDetails) => {
  const userId = user._id;
  const cartTotal = await getCheckoutData(user._id);
  const products = await cartHelpers.getCartProducts(user._id);
  const deliveryAddress = await getDeliveryAddress(orderDetails.address, user._id);
  const { paymentOption } = orderDetails;
  const couponInfo = await cartHelpers.getCartCouponInfo(user._id);

  const orderStatus = orderDetails.paymentOption === 'COD' ? 'Processing' : 'Pending';
  const paymentStatus = orderDetails.paymentOption === 'COD' ? 'Pending' : 'on-hold';
  const orderPlaced = orderDetails.paymentOption === 'COD';

  for (const i in products) {
    products[i].productOrderStatus = orderStatus;
    products[i].productpaymentStatus = paymentStatus;
  }

  // creating order object
  const orderObj = {
    userId: objectId(userId),
    products,
    cartTotal,
    deliveryAddress,
    paymentOption,
    orderPlaced,
    date: new Date(),
    orderId: `EVARA${uuidv4().toString().substring(0, 5)}`,
    couponApplied: couponInfo.couponApplied,
    couponIsActive: couponInfo.couponIsActive,
    couponIsUsed: couponInfo.couponIsUsed,
    couponDiscount: couponInfo.couponDiscount,
    couponDiscountPercentage: couponInfo.couponDiscountPercentage,
  };

  return new Promise((resolve, reject) => {
    db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj)
      .then(async (result) => {
        result.paymentOption = paymentOption;
        result.cartTotal = cartTotal;

        await db.get().collection(COUPON_COLLECTION).updateOne(
          { couponCode: couponInfo.couponApplied },
          {
            $push: {
              couponUsedBy: user._id,
            },
          },
        );

        if (paymentOption === 'COD') {
          // clearing cart
          db.get().collection(CART_COLLECTION).deleteOne({ user: objectId(userId) });
        }
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

// GET ALL ORDERS
const getAllOrders = (userId) => new Promise((resolve, reject) => {
  db.get().collection(ORDER_COLLECTION).find({ userId: objectId(userId) }).sort({ date: -1 })
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

// CANCEL ORDER - ONLINE PAYMENT
const cancelOrder = (orderDetails) => {
  const {
    orderId, productId, newOrderStatus, paymentStatus,
  } = orderDetails;

  return new Promise(async (resolve, reject) => {
    await db.get().collection(ORDER_COLLECTION)

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

// RETURN ORDER - ONLINE PAYMENT
const returnOrder = (orderDetails) => {
  const {
    orderId, productId, newOrderStatus, paymentStatus,
  } = orderDetails;

  return new Promise(async (resolve, reject) => {
    await db.get().collection(ORDER_COLLECTION)

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
  const {
    orderId, productId, newOrderStatus, paymentStatus,
  } = orderDetails;

  return new Promise(async (resolve, reject) => {
    await db.get().collection(ORDER_COLLECTION)

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

// RETURN ORDER - COD
const returnCodOrder = (orderDetails) => {
  console.log(orderDetails);

  const {
    orderId, productId, newOrderStatus, paymentStatus,
  } = orderDetails;

  return new Promise(async (resolve, reject) => {
    await db.get().collection(ORDER_COLLECTION)

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

// eslint-disable-next-line no-return-await
const getRefundDetails = async (orderId, productId) => await db.get().collection(ORDER_COLLECTION)
  .aggregate([
    { $match: { _id: objectId(orderId) } },
    {
      $project: {
        products: {
          $filter: {
            input: '$products',
            as: 'products',
            cond: { $eq: ['$$products.item', objectId(productId)] },
          },
        },
        _id: 0,
        couponDiscountPercentage: 1,
      },
    },
  ]).toArray();

module.exports = {
  getCheckoutData,
  getDeliveryAddress,
  newOrder,
  getAllOrders,
  cancelOrder,
  returnOrder,
  cancelCodOrder,
  returnCodOrder,
  getRefundDetails,
};
