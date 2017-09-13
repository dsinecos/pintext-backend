var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var pintextDatabaseClient = require('../../db/index.js');
var passport = require('passport');
var isAuthenticated = require('./isAuthenticated.js');
var validateUserData = require('./validateUserData.js');

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

  var error = new Error();
  error = {
    status: 500,
    clientMessage: {
      code: '',
      type: '',
      developerMessage: '',
      endUserMessage: ''
    },
    serverMessage: {
      location: 'File - users.js | Route - POST /users/',
      context: 'What action was attempted that led to this error',
      error: null,
    }
  }

  bcrypt.genSalt(saltRounds)
    .then(function (salt) {

      bcrypt.hash(password, salt)
        .then(function (hash) {
          
          var sqlQuery = `INSERT
              INTO pintext_users (username, password)
              VALUES ($1, $2)`;

          pintextDatabaseClient.query(sqlQuery, [req.body.username, hash])
            .then(function (data) {
              res.status(200).send("Account created successfully");
            })
            .catch(function (err) {
              // To check if the sqlQuery is violating the duplication constraint in the table
              if (err.code === '23505') {
                error.status = 400;
                error.clientMessage.developerMessage = "Please choose a different username, that username already exists";
                error.clientMessage.endUserMessage = "Please choose a different username, that username already exists";
                error.serverMessage.context = "Adding query to database"
                error.serverMessage.error = err;

                next(error);
              
              } else {

                error.status = 500;
                error.clientMessage.developerMessage = "Internal server error";
                error.clientMessage.endUserMessage = "Internal server error";
                error.serverMessage.context = "Adding query to database"
                error.serverMessage.error = err;

                next(error);
                
              }
            });

        })
        .catch(function (err) {
          error.status = 500;
          error.clientMessage.developerMessage = "Internal server error";
          error.clientMessage.endUserMessage = "Internal server error";
          error.serverMessage.context = "Error while creating the hash for the password";
          error.serverMessage.error = err;

          next(error);
        })
    })
    .catch(function (err) {
      error.status = 500;
      error.clientMessage.developerMessage = "Internal server error";
      error.clientMessage.endUserMessage = "Internal server error";
      error.serverMessage.context = "Error while generating salt";
      error.serverMessage.error = err;

      next(error);
    });

});

module.exports = router;
