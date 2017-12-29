var bcrypt = require('bcrypt');
var pintextDatabaseClient = require('../../db/index.js');

module.exports = function insertNewUser(saltRounds, username, password, respondUser, next) {

    var responseForUser = "Success";
    // var error = new Error();

    // console.log("This si next " + next);

    // error = {
    //     status: 500,
    //     clientMessage: {
    //         code: '',
    //         type: '',
    //         developerMessage: '',
    //         endUserMessage: ''
    //     },
    //     serverMessage: {
    //         location: 'File - users.js | Route - POST /users/',
    //         context: 'What action was attempted that led to this error',
    //         error: null,
    //     }
    // }

    bcrypt.genSalt(saltRounds)
        .then(function (salt) {

            bcrypt.hash(password, salt)
                .then(function (hash) {

                    var sqlQuery = `INSERT
                  INTO pintext_users (username, password)
                  VALUES ($1, $2)`;

                    pintextDatabaseClient.query(sqlQuery, [username, hash])
                        .then(function (data) {
                            respondUser(responseForUser);
                        })
                        .catch(function (err) {

                            if (next) {
                                next(err);
                            } else {
                                respondUser(error);
                            }
                        });
                })
        });
    }

// bcrypt.genSalt(saltRounds)
//     .then(function (salt) {

//         bcrypt.hash(password, salt)
//             .then(function (hash) {

//                 var sqlQuery = `INSERT
//                   INTO pintext_users (username, password)
//                   VALUES ($1, $2)`;

//                 pintextDatabaseClient.query(sqlQuery, [username, hash])
//                     .then(function (data) {
//                         respondUser(responseForUser);
//                     })
//                     .catch(function (err) {
//                         // To check if the sqlQuery is violating the duplication constraint in the table
//                         if (err.code === '23505') {
//                             error.status = 400;
//                             error.clientMessage.developerMessage = "Please choose a different username, that username already exists";
//                             error.clientMessage.endUserMessage = "Please choose a different username, that username already exists";
//                             error.serverMessage.context = "Adding query to database"
//                             error.serverMessage.error = err;

//                             if (next) {
//                                 next(error);
//                             } else {
//                                 respondUser(error);
//                             }
//                             // next(error);

//                         } else {

//                             error.status = 500;
//                             error.clientMessage.developerMessage = "Internal server error";
//                             error.clientMessage.endUserMessage = "Internal server error";
//                             error.serverMessage.context = "Adding query to database"
//                             error.serverMessage.error = err;

//                             if (next) {
//                                 next(error);
//                             } else {
//                                 respondUser(error);
//                             }

//                             // next(error);

//                         }
//                     });

//             })
//             .catch(function (err) {
//                 error.status = 500;
//                 error.clientMessage.developerMessage = "Internal server error";
//                 error.clientMessage.endUserMessage = "Internal server error";
//                 error.serverMessage.context = "Error while creating the hash for the password";
//                 error.serverMessage.error = err;

//                 if (next) {
//                     next(error);
//                 } else {
//                     respondUser(error);
//                 }

//                 // next(error);
//             })
//     })
//     .catch(function (err) {
//         error.status = 500;
//         error.clientMessage.developerMessage = "Internal server error";
//         error.clientMessage.endUserMessage = "Internal server error";
//         error.serverMessage.context = "Error while generating salt";
//         error.serverMessage.error = err;

//         if (next) {
//             next(error);
//         } else {
//             respondUser(error);
//         }

//         // next(error);
//     });