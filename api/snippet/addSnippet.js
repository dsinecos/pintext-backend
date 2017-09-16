var express = require('express');
var router = express.Router();
var pintextDatabaseClient = require('../../db/index.js');
// var validateSnippetData = require('./validateSnippetData.js');
var isAuthenticated = require('../users/isAuthenticated.js');
var crypto = require('crypto');

module.exports = function (req, res, next) {

    // console.log("Inside POST snippet");

    // run validateSnippetData
    // Get snippet_title, snippet_reference, snippet_content, snippet_created_on, user_id
    // Check for user_id. If false set it as NULL
    // If user_id available set it to variable user_id
    // Create hash for the snippet. Check for uniqueness. If not unique recreate hash.
    // Insert snippet into database
    // Without user_id. Insert user_id as NULL in the usersnippet table and view_for_all as true.
    // With user_id. Insert user_id in the usersnippet table and view_for_all as true.

    // console.log("Inside POST snippet - Before setting variables");
    var snippet_title = req.body.snippet_title;
    var snippet_reference = req.body.snippet_reference;
    var snippet_content = req.body.snippet_content;
    var snippet_created_on = req.body.snippet_created_on
    // console.log("Inside POST snippet - Before setting user_id");
    var user_id = 0;
    getUserID();
    // console.log("Inside POST snippet - After setting user_id before if");

    // console.log("what is req.user.user_id : " + Boolean(req.user.user_id));
    function getUserID() {
        if (req.user) {
            // console.log("Inside POST snippet - Inside if");
            user_id = req.user.user_id;
            checkIfHashIsUnique();
        } else {
            // console.log("Inside POST snippet - Inside else");
            // Retrieve user_id for publicUser from pintext_users table in pintext database
            var sqlQuery = `SELECT user_id FROM pintext_users WHERE username=$1`;
            var publicUser = 'publicUser';

            pintextDatabaseClient.query(sqlQuery, [publicUser]).then(function (result) {
                user_id = result[0].user_id;
                checkIfHashIsUnique();
            }).catch(function (err) {
                var error = new Error();
                error = {
                    status: 500,
                    clientMessage: {
                        code: 'XXX',
                        type: 'Type of error',
                        developerMessage: 'Internal Server Error',
                        endUserMessage: 'Internal Server Error'
                    },
                    serverMessage: {
                        location: 'File - addSnippet.js, Route - POST /snippet/, getUserID',
                        context: 'Retrieving the user_id for the public user',
                        error: err
                    }
                }
                next(error);

            });
        }

    }



    // console.log("Inside POST snippet - After setting user_id");

    // checkIfHashIsUnique();

    function createHashForSnippet() {
        // console.log("Inside createHashForSnippet");

        var toRandomiseInputForHash = "" + (Date.now() + Math.random());
        // console.log("After Variable 1");
        var inputForHash = snippet_title + snippet_reference + snippet_content + snippet_created_on + user_id + toRandomiseInputForHash;
        // console.log("After Variable 2");
        var hash = crypto.createHash('md5').update(inputForHash).digest('hex');
        // console.log("After Variable 3");

        // console.log("Will return the hash now");

        return hash;
    }

    function checkIfHashIsUnique() {

        // console.log("Inside checkIfHashIsUnique");

        var hashForSnippet = createHashForSnippet();

        var sqlQuery = `SELECT EXISTS (SELECT 1 FROM pintext_snippets WHERE snippet_hash=$1)`;

        pintextDatabaseClient.query(sqlQuery, [hashForSnippet]).then(insertSnippet).catch(function (err) {
            var error = new Error();
            error = {
                status: 500,
                clientMessage: {
                    code: 'XXX',
                    type: 'Type of error',
                    developerMessage: 'Internal Server Error',
                    endUserMessage: 'Internal Server Error'
                },
                serverMessage: {
                    location: 'File - addSnippet.js, Route - POST /snippet/, checkIfHashIsUnique',
                    context: 'Checking if the hash created for the snippet is unique in the database',
                    error: err
                }
            }
            next(error);
        });

        function insertSnippet(isHashUnique) {
            // console.log("Inside insertSnippet");

            var sqlQuery = `INSERT INTO pintext_snippets (snippet_title, snippet_reference, snippet_content, snippet_created_on, snippet_hash) VALUES ($1, $2, $3, $4, $5)`;

            // var sqlQueryToInsertUserID = `INSERT INTO pintext_usersnippet (user_id, snippet_id) VALUES()`

            pintextDatabaseClient.query(sqlQuery, [snippet_title, snippet_reference, snippet_content, snippet_created_on, hashForSnippet]).then(getSnippetID).catch(function (err) {
                // console.log(err);
                var error = new Error();
                error = {
                    status: 500,
                    clientMessage: {
                        code: 'XXX',
                        type: 'Type of error',
                        developerMessage: 'Internal Server Error',
                        endUserMessage: 'Internal Server Error'
                    },
                    serverMessage: {
                        location: 'File - addSnippet.js, Route - /snippet/, Function - insertSnippet',
                        context: 'Inserting snippet into database',
                        error: err
                    }
                }
                next(error);
            })
        }

        function insertUserSnippet(snippet_id_object) {
            // console.log("Inside insertUserSnippet");

            var defaultViewForAllStatusForSnippet = true;
            var snippet_id = snippet_id_object[0].snippet_id;

            var sqlQuery = `INSERT INTO pintext_usersnippet (user_id, snippet_id, view_for_all) VALUES ($1, $2, $3)`;

            // console.log("user_id : " + user_id);
            // console.log(snippet_id);

            pintextDatabaseClient.query(sqlQuery, [user_id, snippet_id, defaultViewForAllStatusForSnippet]).then(function () {
                res.status(200).send("Snippet added succesfully");
            }).catch(function (err) {
                var error = new Error();
                error = {
                    status: 500,
                    clientMessage: {
                        code: 'XXX',
                        type: 'Type of error',
                        developerMessage: 'Internal Server Error',
                        endUserMessage: 'Internal Server Error'
                    },
                    serverMessage: {
                        location: 'File - addSnippet.js, Route - /snippet/, Function - insertUserSnippet',
                        context: 'Inserting user_id and snippet_id into database',
                        error: err
                    }
                }
                next(error);
            })
        }

        function getSnippetID() {
            // console.log("Inside getSnippetID");

            var sqlQuery = `SELECT snippet_id FROM pintext_snippets WHERE snippet_hash = $1`;

            pintextDatabaseClient.query(sqlQuery, [hashForSnippet]).then(insertUserSnippet).catch(function (err) {
                var error = new Error();
                error = {
                    status: 500,
                    clientMessage: {
                        code: 'XXX',
                        type: 'Type of error',
                        developerMessage: 'Internal Server Error',
                        endUserMessage: 'Internal Server Error'
                    },
                    serverMessage: {
                        location: 'File - addSnippet.js, Route - /snippet/, Function - getSnippetID',
                        context: 'Getting snippet_id from database',
                        error: err
                    }
                }
                next(error);
            })
        }


    }

}