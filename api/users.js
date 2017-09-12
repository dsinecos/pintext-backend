var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var pintextDatabaseClient = require('../db/index.js');
var passport = require('passport');
var isAuthenticated = require('./isAuthenticated.js');

// For user login
router.post('/login', passport.authenticate('local', { failureRedirect: '/failed' }), function (req, res, next) {
  res.write("Logged in successfully \n");
  var userData = JSON.stringify(req.user, null, "  ");
  res.write("This is the name of the currently logged in user " + userData);
  res.end();
});

// For Failed Login
router.get('/failed', function (req, res, next) {
  res.status(401).send("Login Failed, Try again");
})

// For successive requests after Login
router.get('/rt', isAuthenticated, function (req, res, next) {
  res.write("For Testing successive requests from a logged in user \n");
  res.write("This is the name of the currently logged in user " + JSON.stringify(req.user, null, "  "));
  res.end();
})

// For user signup 
router.post('/', function (req, res, next) {
  console.log("Inside user signup");

  var saltRounds = 10;
  var password = req.body.password;

  bcrypt.genSalt(saltRounds).then(function (salt) {

    bcrypt.hash(password, salt).then(function (hash) {

      //DB operation
      var sqlQuery = `INSERT
              INTO pintext_users (username, password)
              VALUES ($1, $2)`;

      pintextDatabaseClient.query(sqlQuery, [req.body.username, hash]).then(function (data) {
        res.write("Account created successfully");
        res.end();
      }).catch(function (err) {
        // How to check if the error is violating duplication constraint?
        if (err.code === '23505') {
          res.write("Please choose a different username, that username already exists");
          res.end();
          console.log("Error due to duplicate username fields in the dailyreview_user table. Following is the error");
          console.log(err);
        } else {
          res.status(500).send("Internal server error");
          res.end();
          console.log("Error while inserting record into dailyreview_user table. Following is the error");
          console.log(err);
        }
      });

    }).catch(function (err) {
      res.status(500).send("Internal server error");
      res.end();
      console.log("Error while creating the hash for the password. Following is the error");
      console.log(err);
    })
  }).catch(function (err) {
    res.status(500).send("Internal server error");
    res.end();
    console.log("Error while generating salt. Following is the error");
    console.log(err);
  });

});

module.exports = router;
