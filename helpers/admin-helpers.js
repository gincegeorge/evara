var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId

const doAdminLogin = (adminData) => {
    let adminCredentials = { email: 'admin@mail.com', password: '1233' };
    let response = {}
    return new Promise((resolve, reject) => {
        if (adminCredentials.email == adminData.email) {
            if (adminCredentials.password == adminData.password) {
                console.log('credentials match');
                response.adminData = adminCredentials
                response.adminLoginStatus = true
                resolve(response)
            }
            else {
                console.log('Incorrect password');
                response.adminLoginStatus = false
                response.adminLoginError = 'Incorrect password'
                resolve(response)
            }
        } else {
            console.log('Incorrect email');
            response.adminLoginError= 'Invalid email'
            response.adminLoginStatus = false
            resolve(response)
        }
    })
}

module.exports = {
    doAdminLogin
}
