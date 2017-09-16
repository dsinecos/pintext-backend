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
var snippet = require('./api/snippet/snippetRoutes.js');

var app = express();

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

require('./api/users/setupPublicUser.js');

app.use('/', index);
app.use('/users', users);
app.use('/snippet', snippet);

app.use(require('./errorHandler.js'));

module.exports = app;
