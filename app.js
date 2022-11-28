/* eslint-disable linebreak-style */
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
// eslint-disable-next-line no-unused-vars
const paypal = require('paypal-rest-sdk');
const db = require('./config/connection');

const app = express();
/* -------------------------------------------------------------------------- */
/*                             Database connection                            */
/* -------------------------------------------------------------------------- */
db.connect((err) => {
  if (err) {
    console.log(`Database connection error${err}`);
  } else {
    console.log('Database connected successfully on http://localhost:8080');
  }
});
/* -------------------------------------------------------------------------- */
/*                             Routes                                         */
/* -------------------------------------------------------------------------- */
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
/* -------------------------------------------------------------------------- */
/*                             Session creation                               */
/* -------------------------------------------------------------------------- */
app.use(session({
  secret: 'Key',
  cookie: { maxAge: 600000 },
  resave: true,
  saveUninitialized: true,
}));
/* -------------------------------------------------------------------------- */
/*                             SPLITING URL                                   */
/* -------------------------------------------------------------------------- */
// app.use(function (req, res, next) {
//   req.active = req.path.split('/')[2]
//   next();
// });
/* -------------------------------------------------------------------------- */
/*                             view engine setup                              */
/* -------------------------------------------------------------------------- */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
/* -------------------------------------------------------------------------- */
/*                                  APP.USE                                   */
/* -------------------------------------------------------------------------- */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/admin', adminRouter);



/* -------------------------------------------------------------------------- */
/*                catch 404 and forward to error handler                      */
/* -------------------------------------------------------------------------- */
app.use(function (req, res, next) {
  next(createError(404));
});
/* -------------------------------------------------------------------------- */
/*                      error handler middleware                              */
/* -------------------------------------------------------------------------- */
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('user/404');
});

module.exports = app;
