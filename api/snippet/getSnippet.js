var pintextDatabaseClient = require('../../db/index.js');
// var validateSnippetData = require('./validateSnippetData.js');

module.exports = function (req, res, next) {

    // console.log("This is param : " + req.param);
    // console.log("This is params : " + JSON.stringify(req.params, null, "  "));

    var snippet_hash = req.params.hash;

    // console.log("Hash : " + req.params.hash);

    var user_id = 0;
    var snippet_id;
    var snippet_title;
    var snippet_reference;
    var snippet_content;
    var snippet_created_on;
    var snippet_updated_on;
    var usersnippet_user_id;
    var usersnippet_view_for_all;

    // Get hash from param
    // Check if there is an existing user_id. If not setup the user_id as that of the public
    // Extract the snippet data and snippet_id against the hash
    // Check if the snippet_id is against the variable setup as user_id. If yes display the snippet
    // If no, check what is the view_for_all status for the snippet and display the snippet accordingly
    // If the view_for_all status is false, return unauthorized error

    getUserID();
    // extractSnippetFromTable();
    // checkDisplayStatusForSnippet();
    // displaySnippet();

    function getUserID() {
        if (req.user) {
            // console.log("Inside POST snippet - Inside if");
            user_id = req.user.user_id;
            extractSnippetFromTable();
        } else {
            // console.log("Inside POST snippet - Inside else");
            // Retrieve user_id for publicUser from pintext_users table in pintext database
            var sqlQuery = `SELECT user_id FROM pintext_users WHERE username=$1`;
            var publicUser = 'publicUser';

            pintextDatabaseClient.query(sqlQuery, [publicUser]).then(function (result) {
                user_id = result[0].user_id;
                extractSnippetFromTable();
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
                        location: 'File - getSnippet.js, Route - GET /snippet/:hash, getUserID',
                        context: 'Retrieving the user_id for the public user',
                        error: err
                    }
                }
                next(error);

            });
        }
    }

    function extractSnippetFromTable() {
        var sqlQuery = `SELECT * FROM pintext_snippets WHERE snippet_hash=$1`;

        pintextDatabaseClient.query(sqlQuery, [snippet_hash]).then(function (result) {

            // console.log("This is the result : " + JSON.stringify(result, null, "  "));
            // console.log("Are we referencing it right? " + result[0].snippet_title);
            // console.log("This is the snippet_hash : " + snippet_hash);

            snippet_id = result[0].snippet_id;
            snippet_title = result[0].snippet_title;
            snippet_reference = result[0].snippet_reference;
            snippet_content = result[0].snippet_content;
            snippet_created_on = result[0].snippet_created_on;
            snippet_updated_on = result[0].snippet_updated_on || 0;

            checkDisplayStatusForSnippet();

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
                    location: 'File - getSnippet.js, Route - GET /snippet/:hash, extractSnippetFromTable',
                    context: 'Retrieving the snippet from the table',
                    error: err
                }
            }
            next(error);

        })
    }

    function checkDisplayStatusForSnippet() {

        console.log("Inside checkDisplayStatusForSnippet");
        // console.log("This is the snippet_id inside : " + snippet_id);
        // var snippet_id = snippet_id;

        var sqlQuery = `SELECT * FROM pintext_usersnippet WHERE snippet_id=$1`;

        // pintextDatabaseClient.query(sqlQuery, [snippet_id]).then(function(result) {
        //     console.log("This is the result");
        //     console.log(JSON.stringify(result, null, "  "));    
        // }).catch(function(err) {
        //     console.log("This is the error ");
        //     console.log(err);
        // })

        pintextDatabaseClient.query(sqlQuery, [snippet_id]).then(function (result) {

            // console.log("This is the usersnippet result : " + result);

            var usersnippet_user_id = result[0].user_id;
            var usersnippet_view_for_all = result[0].view_for_all;

            if (usersnippet_view_for_all) {
                displaySnippet();
            } else {
                if (usersnippet_user_id === user_id) {
                    displaySnippet();
                } else {
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
                            location: 'File - getSnippet.js, Route - GET /snippet/:hash, Function - checkDisplayStatusForSnippet',
                            context: 'Unauthorized',
                            error: null
                        }
                    }
                    next(error);

                }

            }
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
                    location: 'File - getSnippet.js, Route - GET /snippet/:hash, checkDisplayStatusForSnippet',
                    context: 'Retrieving usersnippet data against a snippet_id',
                    error: err
                }
            }
            next(error);
        })
    }

    function displaySnippet() {

        // console.log("Inside displaySnippet");

        var snippet = {
            snippet_id: snippet_id,
            snippet_title: snippet_title,
            snippet_reference: snippet_reference,
            snippet_content: snippet_content,
            snippet_created_on: snippet_created_on,
            snippet_updated_on: snippet_updated_on,
            snippet_hash: snippet_hash
        }

        res.status(200).json(snippet);
    }


}