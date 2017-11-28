var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var pintextDatabaseClient = require('../../db/index.js');
var passport = require('passport');
var isAuthenticated = require('./isAuthenticated.js');
var validateUserData = require('./validateUserData.js');
var insertNewUser = require('./insertNewUser.js');

// For user login
router.post('/login', validateUserData, passport.authenticate('local', { failureRedirect: '/failed' }), function (req, res, next) {
  res.write("Logged in successfully \n");
  res.end();
});

// For Failed Login
router.get('/failed', function (req, res, next) {

  var error = new Error();
  error = {
    status: 401,
    clientMessage: {
      code: '',
      type: '',
      developerMessage: 'Unauthorized',
      endUserMessage: 'Unauthorized'
    },
    serverMessage: {
      location: 'File - users.js',
      context: 'Unauthorized',
      error: null
    }
  }
  next(error);
})

// For successive requests after Login
router.get('/rt', isAuthenticated, function (req, res, next) {
  res.write("This is the name of the currently logged in user " + JSON.stringify(req.user, null, "  "));
  res.end();
})

// For user signup 
router.post('/', validateUserData, function (req, res, next) {

  var saltRounds = 10;
  var password = req.body.password;
  var username = req.body.username;

  function respondUser(responseForUser) {
    res.status(200).send(responseForUser);
    console.log(responseForUser);
  }

  insertNewUser(saltRounds, username, password, respondUser, next);  

});

router.get('/logout', function(req, res, next) {
  req.logOut();
  req.session.destroy(function (err) {
    res.write("Logged out");
    res.end();
  });
});

module.exports = router;
