//Delete product images
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
