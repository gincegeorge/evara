const debugDb = require('debug')('db')

const adminDebug = require('debug')('admin')

const userDebug = require('debug')('user')

module.exports = {
    debugDb,
    adminDebug,
    userDebug
}

//XXX $env:DEBUG = "admin","db","user"