/*--------------------------------------------------------------*/
//                         ADD TO CART
/*--------------------------------------------------------------*/
function addToCart(productId) {
    $.ajax({
        url: '/add-to-cart/' + productId,
        method: 'get',
        success: (response) => {
            if (response.success) {
                let count = $('#cartCount').html()
                count = parseInt(count) + 1
                $('#cartCount').html(count)
            }
        }
    })
}
/*--------------------------------------------------------------*/
//                       CHANGE QUANTITY
/*--------------------------------------------------------------*/
function changeQuantity(cartId, productId, count, price) {

    let quantity = parseInt(document.getElementById(productId).innerHTML)
    count = parseInt(count)
    price = parseInt(price)

    $.ajax({
        url: '/change-product-quantity',
        data: {
            cart: cartId,
            product: productId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.status) {

                document.getElementById(productId).innerHTML = quantity + count
                document.getElementById(productId + '-totalPrice').innerHTML = (quantity + count) * price
                $('.cartTotal').html(response.cartTotal)

                productRow = '#' + productId + '-tr'

                if (quantity + count == 1) {
                    $(productRow + ' .qty-down').addClass('disabled')
                } else {
                    $(productRow + ' .qty-down').removeClass('disabled')
                }
            }
        }
    })
}
/*--------------------------------------------------------------*/
//                  REMOVE PRODUCT FROM CART
/*--------------------------------------------------------------*/
function removeProductFromCart(cartId, productId, productName) {
    Swal.fire({
        title: 'Remove item',
        text: 'Are you sure you want to remove this item?',
        showCancelButton: true,
        confirmButtonText: 'Remove',
        iconHtml: null
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/delete-product-from-cart',
                data: {
                    cart: cartId,
                    product: productId
                },
                method: 'post',
                success: (response) => {
                    if (response.cartItemsCount === 0) {
                        window.location.reload()
                    } else {
                        if (response.productRemoved) {
                            Swal.fire({
                                title: 'Removed',
                                text: productName + ' removed from your cart',
                                timer: 1500
                            })
                            const ProRow = document.getElementById(productId + '-tr')
                            $(ProRow).remove()
                        }
                    }
                }
            })
        }
    })
}
/*--------------------------------------------------------------*/
//                          PLACE ORDER
/*--------------------------------------------------------------*/
function placeOrder() {

    const addressList = document.getElementsByClassName('deliveryAddress');
    for (let i = 0; i < addressList.length; i++) {
        if (addressList[i].type === 'radio' && addressList[i].checked) {
            address = addressList[i].value;
        }
    }

    const paymentOptions = document.getElementsByClassName('payment_option');
    for (let i = 0; i < paymentOptions.length; i++) {
        if (paymentOptions[i].type === 'radio' && paymentOptions[i].checked) {
            paymentOption = paymentOptions[i].value;
        }
    }

    $.ajax({
        url: '/place-order',
        method: 'post',
        data: { address, paymentOption },
        success: (response) => {
            if (response.paymentOption == 'COD') {
                location.href = '/order-placed'
            } else if (response.paymentOption == 'razorPay') {
                razorPayment(response)
            } else {
                location.href = response.redirectLink
                //razorPayment(response)
            }
        } 
    })
}


function razorPayment(order) {
    var options = {
        "key": 'rzp_test_9scI0suJFqsoH3',
        "amount": order.amount,
        "currency": "INR",
        "name": "Evara Online Shopping",
        "description": "Test Transaction",
        "image": "http://localhost:8080/user-assets/imgs/theme/logo.svg",
        "order_id": order.id,
        //"callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
        "handler": function (response) {
            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}


function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        method: 'post',
        data: {
            payment,
            order
        },
        success: (response) => {
           location.href = '/order-placed'
        }
    })
}
/*--------------------------------------------------------------*/
//                        ADD ADDRESS
/*--------------------------------------------------------------*/
$(document).ready(function () {
    $('#add-address-checkout').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: '/my-account/address/new',
            method: 'post',
            data: $('#add-address-checkout').serialize(),
            success: (response) => {
                window.location.reload()
            }
        })
    });
});
/*--------------------------------------------------------------*/
//                        DELETE ADDRESS
/*--------------------------------------------------------------*/
function deleteAddress(userId, addressId) {
    Swal.fire({
        title: 'Remove Address',
        text: 'Are you sure you want to remove this address?',
        showCancelButton: true,
        confirmButtonText: 'Remove',
        iconHtml: null
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/my-account/address/delete',
                data: {
                    userId, addressId
                },
                method: 'delete',
                success: (response) => {
                    console.log(response);
                    if (response.modifiedCount) {
                        Swal.fire({
                            title: 'Removed',
                            text: 'Address removed from your account',
                            timer: 1500
                        })
                        const addressRow = document.getElementById(addressId)
                        $(addressRow).remove()
                    } else {
                        Swal.fire({
                            title: 'Error',
                            timer: 1500
                        })
                    }
                }
            })
        }
    })
}
/*--------------------------------------------------------------*/
//                        EDIT ADDRESS
/*--------------------------------------------------------------*/
function editAddress() {
    Swal.fire({
        title: 'Nope',
        text: 'Please delete it',
        iconHtml: null
    })
}
/*--------------------------------------------------------------*/
//             CANCEL ORDER - ONLINE PAYMENT
/*--------------------------------------------------------------*/
function cancelOrder(orderId, productId) {

    const newOrderStatus = 'Canceled'
    const paymentStatus =  'Refunded'

    Swal.fire({
        title: 'Cancel order',
        text: 'Are you sure you want to cancel this product?',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        iconHtml: null
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/my-account/order/cancel',
                data: {
                    orderId, productId, newOrderStatus, paymentStatus
                },
                method: 'patch',
                success: (response) => {
                    console.log(response);
                    if (response.modifiedCount) {
                        window.location.reload()
                    } else {
                        Swal.fire({
                            title: 'Error',
                            timer: 1500
                        })
                    }
                }
            })
        }
    })
}

/*--------------------------------------------------------------*/
//               RETURN ORDER - ONLINE PAYMENT
/*--------------------------------------------------------------*/
function returnOrder(orderId, productId) {

    const newOrderStatus = 'Returned'
    const paymentStatus =  'Refunded'

    Swal.fire({
        title: 'Return order',
        text: 'Are you sure you want to return this product?',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        iconHtml: null
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/my-account/order/return',
                data: {
                    orderId, productId, newOrderStatus, paymentStatus
                },
                method: 'patch',
                success: (response) => {
                    console.log(response);
                    if (response.modifiedCount) {
                        window.location.reload()
                    } else {
                        Swal.fire({
                            title: 'Error',
                            timer: 1500
                        })
                    }
                }
            })
        }
    })
}

/*--------------------------------------------------------------*/
//             CANCEL ORDER - COD
/*--------------------------------------------------------------*/
function cancelCodOrder(orderId, productId) {

    const newOrderStatus = 'Canceled'
    const paymentStatus =  'Canceled'

    Swal.fire({
        title: 'Cancel order',
        text: 'Are you sure you want to cancel this product?',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        iconHtml: null
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/my-account/order/cancel-cod',
                data: {
                    orderId, productId, newOrderStatus, paymentStatus
                },
                method: 'patch',
                success: (response) => {
                    console.log(response);
                    if (response.modifiedCount) {
                        window.location.reload()
                    } else {
                        Swal.fire({
                            title: 'Error',
                            timer: 1500
                        })
                    }
                }
            })
        }
    })
}

/*--------------------------------------------------------------*/
//               RETURN ORDER - COD
/*--------------------------------------------------------------*/
function returnCodOrder(orderId, productId) {

    const newOrderStatus = 'Returned'
    const paymentStatus =  'Refunded'

    Swal.fire({
        title: 'Return order',
        text: 'Are you sure you want to return this product?',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        iconHtml: null
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/my-account/order/return-cod',
                data: {
                    orderId, productId, newOrderStatus, paymentStatus
                },
                method: 'patch',
                success: (response) => {
                    console.log(response);
                    if (response.modifiedCount) {
                        window.location.reload()
                    } else {
                        Swal.fire({
                            title: 'Error',
                            timer: 1500
                        })
                    }
                }
            })
        }
    })
}

