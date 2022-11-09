/*--------------------------------------------------------------*/
//                   DELETE PRODUCT IMAGES
/*--------------------------------------------------------------*/
function deleteProductImage(prodId, imgName) {
    $.ajax({
        url: 'remove-product-image/' + prodId + '/' + imgName,
        type: 'GET',
        success: function (response) {
            if (response) {
                const imgDir = document.getElementById('edit-product-images')
                const img = document.getElementById(imgName)
                imgDir.removeChild(img)
            }
        }
    })
}


/*--------------------------------------------------------------*/
//                 CHANGE ORDER STATUS -ADMIN
/*--------------------------------------------------------------*/
function changeOrderStatus(orderId, productId) {

    const selectId = '#' + productId + '-status'
    const orderStatus = $(selectId).find(":selected").text();

    Swal.fire({
        title: 'Change order status',
        text: 'Are you sure to change order status to ' + orderStatus + '?',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        iconHtml: null
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/admin/order/change-status',
                data: {
                    orderId, productId, orderStatus
                },
                method: 'patch',
                success: (response) => {
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
        else {
            window.location.reload()
        }
    })
}


/*--------------------------------------------------------------*/
//                 CANCEL ORDER - ADMIN
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
                url: '/admin/order/cancel',
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
//                 CANCEL ORDER - COD
/*--------------------------------------------------------------*/
function cancelCodOrder(orderId, productId) {

    const newOrderStatus = 'Canceled'

    Swal.fire({
        title: 'Cancel order',
        text: 'Are you sure you want to cancel this product?',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        iconHtml: null
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/admin/order/cancel-cod',
                data: {
                    orderId, productId, newOrderStatus
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
                'previous': '<i class="material-icons md-chevron_left"></i>',
                'next': '<i class="material-icons md-chevron_right"></i>'
            }
        },
        searching: true,
        info: false,
        bFilter: false,
        bInfo: false,
        bLengthChange: false,
        "oLanguage": { "sSearch": "" }
    });
    $('.dataTables_filter input').addClass('form-control').attr("placeholder", "Search...");
});


/*--------------------------------------------------------------*/
//             DISABLE FUTURE DATES-SALES REPORT
/*--------------------------------------------------------------*/
$(function () {
    var dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();

    if (month < 10)
        month = '0' + month.toString();
    if (day < 10)
        day = '0' + day.toString();

    var maxDate = year + '-' + month + '-' + day;
    $('#date').attr('max', maxDate);

    var maxMonth = year + '-' + month
    $('#month').attr('max', maxMonth);
});

/*--------------------------------------------------------------*/
//                     SALES REPORT TABLE
/*--------------------------------------------------------------*/
$('#reportTable1').DataTable({
    bPaginate: false,
    searching: false,
    info: false,
    bFilter: false,
    bInfo: false,
    bLengthChange: false,
    dom: 'Bfrtip',
    buttons: [
        'csvHtml5',
        'pdfHtml5'
    ]
});
