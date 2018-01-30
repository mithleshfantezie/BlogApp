var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var adaro = require('adaro');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var dust = require('dustjs-helpers');
var flash = require('connect-flash');
var session = require('express-session');
var expressValidator = require('express-validator');


var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var moment = require('moment');

// view engine setup
app.engine('dust', adaro.dust());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true

}));

//connect-flash middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  var messages = require('express-messages')(req, res);
    res.locals.messages = function (chunk, context, bodies, params) {
        return chunk.write(messages());
    };
    next();
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});






module.exports = app;
