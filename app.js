var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');

var connectPgSimple = require('connect-pg-simple')(session);
var PostgreSqlStore = new connectPgSimple({
  conString: process.env.DATABASE_URL || "pg://postgres:postgres@localhost:5432/pintext",
  tableName: "pintext_session",
  pruneSessionInterval: false,
});

var sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: PostgreSqlStore,
  // cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
  cookie: { maxAge: null, httpOnly: false },
  proxy: true
};

var index = require('./api/index');
var users = require('./api/users/users.js');
var snippet = require('./api/snippet/snippetRoutes.js');

var app = express();

var allowCrossDomain = function (req, res, next) {

  var allowedOrigins = ['http://localhost:8080', 'https://pintext-frontend.herokuapp.com', 'http://localhost:5000'];
  var origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}
app.use(allowCrossDomain);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('trust proxy', 1);

app.use(function(req, res, next) {

  console.log("req.hostname : " + req.hostname);
  console.log("req.protocol : " + req.protocol);
  console.log("req.ip       : " + req.ip);
  console.log("req.ips      : " + req.ips);

  next();
})

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionOptions));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
require('./api/users/passportLocalAuthentication.js')(passport);

require('./api/users/setupPublicUser.js');

app.use('/', index);
app.use('/user', users);
app.use('/snippet', snippet);

app.use(require('./errorHandler.js'));

module.exports = app;
