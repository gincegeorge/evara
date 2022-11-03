const multer = require('multer')

//set storage
var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/products-uploads')
    },
    filename: (req, file, callback) => {
        var extension = file.originalname.substr(file.originalname.lastIndexOf('.'))
        callback(null, file.fieldname + '_' + Date.now() + extension)
    }
})

store = multer({ storage: storage })

module.exports = store 