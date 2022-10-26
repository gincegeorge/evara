const { response } = require("../../app");

function addToCart(productId){
    $.ajax({
        url:'/add-to-cart/'+productId,
        method:'get',
        success:(response)=>{
            if(response.success){
                let count = $('#cartCount').html()
                count = parseInt(count)+1
                $('#cartCount').html(count)
            }
        }
    })
}