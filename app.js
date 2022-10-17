require ('dotenv').config(); 
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//const hbs = require('express-handlebars')
const db = require('./config/connection')
const session = require('express-session')
var app = express();

/* -------------------------------------------------------------------------- */
/*                             Database connection                            */
/* -------------------------------------------------------------------------- */
db.connect((err)=>{
  if(err){
    console.log('Database connection error'+err);
  }else{
    console.log('Database connected successfully');
  }
})
/* -------------------------------------------------------------------------- */
/*                             Routes                                         */
/* -------------------------------------------------------------------------- */
var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');
/* -------------------------------------------------------------------------- */
/*                             Session creation                               */
/* -------------------------------------------------------------------------- */
app.use(session({
  secret:'Key',
  cookie:{maxAge:600000},
  resave: true, 
  saveUninitialized: true
}));
/* -------------------------------------------------------------------------- */
/*                             view engine setup                              */
/* -------------------------------------------------------------------------- */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs')

// app.set('view engine', 'hbs');
// app.engine('hbs', hbs.engine({
//   extname: 'hbs',
//   defaultLayout: false,
//   layoutsDir: __dirname + '/views/layout/',
//   partialsDir: __dirname + '/views/partials'
// }))
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
app.use(function(req, res, next) {
  next(createError(404));
});
/* -------------------------------------------------------------------------- */
/*                      error handler middleware                              */
/* -------------------------------------------------------------------------- */
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;