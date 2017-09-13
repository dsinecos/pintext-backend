var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');

var connectPgSimple = require('connect-pg-simple')(session);
var PostgreSqlStore = new connectPgSimple({
  conString: "pg://postgres:postgres@localhost:5432/pintext",
  tableName: "pintext_session",
  pruneSessionInterval: false,
});

var sessionOptions = {
  secret: "Able was i ere i saw elbA",
  resave: false,
  saveUninitialized: false,
  store: PostgreSqlStore,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
};

var index = require('./api/index');
var users = require('./api/users/users.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionOptions));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
require('./api/users/passportLocalAuthentication.js')(passport);

app.use('/', index);
app.use('/users', users);

app.use(require('./errorHandler.js'));

/*
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
});
*/

module.exports = app;
