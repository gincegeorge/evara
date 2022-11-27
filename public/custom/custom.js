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

                //HIDE ADD TO WISHLIST BUTTON
                let addtocartBtn = '#' + productId + '-addToCart'
                let gotocartBtn = '#' + productId + '-goToCart'
                $(addtocartBtn).remove();
                $(gotocartBtn).addClass('visible')
            } else if (response.loginRedirect) {
                location.href = '/login'
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
                                timer: 700,
                                showConfirmButton: false
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

    //disable checkout button
    $('.checkoutBtn').addClass('disabled')

    //get chosen address
    const addressList = document.getElementsByClassName('deliveryAddress');
    for (let i = 0; i < addressList.length; i++) {
        if (addressList[i].type === 'radio' && addressList[i].checked) {
            address = addressList[i].value;
        }
    }

    //get payment method
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

            if (response.paymentOption == 'Paypal') {
                location.href = response.redirectLink
            } else if (response.paymentOption == 'razorPay') {
                razorPayment(response)
            } else if (response.paymentOption == 'COD') {
                location.href = '/order-placed'
            }
        }
    })
}

/*--------------------------------------------------------------*/
//                          RAZORPAY
/*--------------------------------------------------------------*/
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
            "name": "Gince George",
            "email": "gincegeorge@example.com",
            "contact": "7560990303"
        },
        "notes": {
            "address": "Evara Fasion Ltd"
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
function editAddress(userId, addressId, name, phone, addressLine, state, city, zipCode, email) {
    Swal.fire({
        title: 'Edit address',
        showCancelButton: true,
        html: ` 
        <form id="add-address-checkout" action="">
                  <div class="form-group">
                    <input id="Name" required type="text" name="name" placeholder="Full name *" value="`+ name + `">
                  </div>
                  <div class="form-group">
                    <input id="addressLine" required type="text" name="addressLine" required="" placeholder="Address *" value="`+ addressLine + `">
                  </div> 
                  <div class="form-group">
                    <input id="city" required type="text" name="city" placeholder="City / Town *" value="`+ city + `">
                  </div>
                  <div class="form-group">
                    <input id="state" required type="text" name="state" placeholder="State / County *" value="`+ state + `">
                  </div>
                  <div class="form-group">
                    <input required id="zipCode" type="text" name="zipCode" placeholder="Postcode / ZIP *" value="`+ zipCode + `">
                  </div> 
                  <div class="form-group">
                    <input required id="phone" type="text" name="phone" placeholder="Phone *" value="`+ phone + `">
                  </div>
                  <div class="form-group">
                    <input required id="email" type="text" name="email" placeholder="Email address *" value="`+ email + `">
                  </div>
                </form>
        `,
        confirmButtonText: 'Update address',
        focusConfirm: false,
        // preConfirm: () => {
        //     name = Swal.getPopup().querySelector('#Name').value,
        //         addressLine = Swal.getPopup().querySelector('#addressLine').value,
        //         city = Swal.getPopup().querySelector('#city').value,
        //         state = Swal.getPopup().querySelector('#state').value,
        //         zipCode = Swal.getPopup().querySelector('#zipCode').value,
        //         phone = Swal.getPopup().querySelector('#phone').value,
        //         email = Swal.getPopup().querySelector('#email').value
        //     if (!name || !addressLine || !city || !state || !zipCode || !phone || !email) {
        //         Swal.showValidationMessage(`Please fill the required fields`)
        //     }
        //     return { userId, addressId, name, phone, addressLine, state, city, zipCode, email }
        // }
    }).then((result) => {

        if (result.isConfirmed) {
            $.ajax({
                url: '/my-account/address/edit',
                method: 'post',
                data: result.value,
                success: (response) => {
                    if (response.addressEdited) {
                        window.location.reload()
                    }
                }
            })
        }
    })
}
/*--------------------------------------------------------------*/
//             CANCEL ORDER - ONLINE PAYMENT
/*--------------------------------------------------------------*/
function cancelOrder(orderId, productId) {

    const newOrderStatus = 'Canceled'
    const paymentStatus = 'Refunded'

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
    const paymentStatus = 'Refunded'

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
    const paymentStatus = 'Canceled'

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
    const paymentStatus = 'Refunded'

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

/*--------------------------------------------------------------*/
//                         DATA TABLES
/*--------------------------------------------------------------*/
$(document).ready(function () {
    $('#myDataTable').DataTable({
        language: {
            'paginate': {
                'previous': '<',
                'next': '>'
            }
        },
        searching: false,
        info: false,
        bFilter: false,
        bInfo: false,
        bLengthChange: false,
        order: [[4, 'asc']],
    });
});

/*--------------------------------------------------------------*/
//                         ADD TO WISHLIST
/*--------------------------------------------------------------*/
function addToWishlist(productId) {
    $.ajax({
        url: '/wishlist/add-product/' + productId,
        method: 'get',
        success: (response) => {
            if (response.success) {
                //HIDE ADD TO WISHLIST BUTTON
                let wishlistWrap = '#' + productId + '-wishlistWrap'
                $(wishlistWrap).addClass("productInWishlist");
            } else if (response.loginRedirect) {
                location.href = '/login'
            }
        }
    })
}

/*--------------------------------------------------------------*/
//                 REMOVE FROM WISHLIST- TOGGLE
/*--------------------------------------------------------------*/
function removeFromWishlist(productId) {
    $.ajax({
        url: '/wishlist/remove-product',
        data: {
            product: productId
        },
        method: 'delete',
        success: (response) => {
            if (response.productRemoved) {
                //HIDE ADD TO WISHLIST BUTTON
                let wishlistWrap = '#' + productId + '-wishlistWrap'
                $(wishlistWrap).removeClass("productInWishlist");
            }
        }
    })
}
/*--------------------------------------------------------------*/
//               REMOVE PRODUCT FROM -WISHLIST
/*--------------------------------------------------------------*/
function removeProductFromWishlist(productId) {
    Swal.fire({
        title: 'Remove item',
        text: 'Are you sure you want to remove this item?',
        showCancelButton: true,
        confirmButtonText: 'Remove',
        iconHtml: null
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/wishlist/remove-product',
                data: {
                    product: productId
                },
                method: 'delete',
                success: (response) => {
                    if (response.wishlistCount === 0) {
                        window.location.reload()
                    } else {
                        if (response.productRemoved) {
                            const ProRow = document.getElementById(productId + '-tr')
                            $(ProRow).remove()
                            Swal.fire({
                                title: 'Removed',
                                timer: 700,
                                showConfirmButton: false
                            })

                        }
                    }
                }
            })
        }
    })
}
/*--------------------------------------------------------------*/
//                  ADD TO CART FROM WISHLIST
/*--------------------------------------------------------------*/
function addtocartFromWishlist(wishlistId, productId) {
    $.ajax({
        url: '/wishlist/addtocart',
        data: {
            wishlist: wishlistId,
            product: productId
        },
        method: 'patch',
        success: (response) => {
            if (response.wishlistCount === 0) {
                window.location.reload()
            } else {
                if (response.productRemoved) {
                    const ProRow = document.getElementById(productId + '-tr')
                    $(ProRow).remove()
                    Swal.fire({
                        title: 'Added to cart',
                        timer: 700,
                        showConfirmButton: false
                    })
                }
            }
        }
    })
}
/*--------------------------------------------------------------*/
//                           SEARCH
/*--------------------------------------------------------------*/
function sendData(data) {
    const searchResults = document.getElementById('searchResults')
    fetch('/search', {
        method: 'post',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ payload: data.value })
    }).then(res => res.json()).then(data => {
        let result = data.searchQuery
        searchResults.innerHTML = '';
        if (data.resultfound) {
            if (result.length < 1) {
                searchResults.style.display = 'block';
                searchResults.innerHTML = '<p>Sorry, nothing found!</p>'
                return
            }
            searchResults.style.display = 'block';
            result.forEach((item, index) => {
                searchResults.innerHTML += `<p><a href="/product/${item.slug}">${item.name}</a></p>`
            });
        } else {
            searchResults.style.display = 'none';
        }
    })
}

//hide results when clicked outside
document.addEventListener('click', function handleClickOutsideBox(event) {
    const box = document.getElementById('searchWrap');
    const searchResults = document.getElementById('searchResults');

    if (!box.contains(event.target)) {
        searchResults.style.display = 'none';
    }
});