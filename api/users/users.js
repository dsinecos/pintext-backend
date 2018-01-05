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
  res.status(200).json({
    developmentMessage: "Success"
  })
});

// For Failed Login
router.get('/failed', function (req, res, next) {
  res.status(401).json({
    developmentMessage: "Failed"
  })
})

// For successive requests after Login
router.get('/rt', isAuthenticated, function (req, res, next) {
  res.write("This is the name of the currently logged in user " + JSON.stringify(req.user, null, "  "));
  res.end();
})

// For user signup 
router.post('/signup', validateUserData, function (req, res, next) {

  var saltRounds = 10;
  var password = req.body.password;
  var username = req.body.username;

  bcrypt.genSalt(saltRounds)
    .then(function (salt) {

      bcrypt.hash(password, salt)
        .then(function (hash) {

          var sqlQuery = `INSERT
                  INTO pintext_users (username, password)
                  VALUES ($1, $2)`;

          pintextDatabaseClient.query(sqlQuery, [username, hash])
            .then(function (data) {
              res.status(200).json({
                developmentMessage: "Success"
              });
            })
            .catch(function (err) {

              next(err);
            })
        });
    });
});

router.get('/logout', isAuthenticated, function (req, res, next) {
  
  req.logOut();
  
  req.session.destroy(function (err) {
    if(err) {
      next(err);
    }

    res.status(200).clearCookie('connect.sid', {path: '/'}).json({
      developmentMessage: "Success"
    });

  });
});

module.exports = router;
