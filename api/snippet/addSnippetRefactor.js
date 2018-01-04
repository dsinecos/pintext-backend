var express = require('express');
var router = express.Router();
var pintextDatabaseClient = require('../../db/index.js');
// var validateSnippetData = require('./validateSnippetData.js');
var isAuthenticated = require('../users/isAuthenticated.js');
var crypto = require('crypto');

module.exports = function (req, res, next) {

    var snippet_title = req.body.snippet_title;
    var snippet_reference = req.body.snippet_reference;
    var snippet_content = req.body.snippet_content;
    var snippet_created_on = req.body.snippet_created_on
    var user_id = 0;

    getUserID();

    function getUserID() {
        if (req.user) {
            user_id = req.user.user_id;
            checkIfHashIsUnique();
        } else {
            var sqlQuery = `SELECT user_id FROM pintext_users WHERE username=$1`;
            var publicUser = 'publicUser';

            pintextDatabaseClient
                .query(sqlQuery, [publicUser])
                .then(function (result) {
                    user_id = result[0].user_id;
                    checkIfHashIsUnique();
                })
                .catch(function (err) {
                    next(err);
                });
        }

    }

    function createHashForSnippet() {

        var toRandomiseInputForHash = "" + (Date.now() + Math.random());
        var inputForHash = snippet_title + snippet_reference + snippet_content + snippet_created_on + user_id + toRandomiseInputForHash;
        var hash = crypto.createHash('md5').update(inputForHash).digest('hex');

        return hash;
    }

    function checkIfHashIsUnique() {

        var hashForSnippet = createHashForSnippet();

        var sqlQuery = `SELECT EXISTS (SELECT 1 FROM pintext_snippets WHERE snippet_hash=$1)`;

        pintextDatabaseClient
            .query(sqlQuery, [hashForSnippet])
            .then(insertSnippet)
            .catch(function (err) {
                next(err);
            });

        function insertSnippet(isHashUnique) {

            var sqlQuery = `INSERT INTO pintext_snippets (snippet_title, snippet_reference, snippet_content, snippet_created_on, snippet_hash) VALUES ($1, $2, $3, $4, $5)`;

            pintextDatabaseClient
                .query(sqlQuery, [snippet_title, snippet_reference, snippet_content, snippet_created_on, hashForSnippet])
                .then(getSnippetID)
                .catch(function (err) {
                    next(err);
                })
        }

        function insertUserSnippet(snippet_id_object) {

            var defaultViewForAllStatusForSnippet = true;

            if (req.user) {
                defaultViewForAllStatusForSnippet = false;
            }

            var snippet_id = snippet_id_object[0].snippet_id;

            var sqlQuery = `INSERT INTO pintext_usersnippet (user_id, snippet_id, view_for_all) VALUES ($1, $2, $3)`;

            pintextDatabaseClient
                .query(sqlQuery, [user_id, snippet_id, defaultViewForAllStatusForSnippet])
                .then(function () {
                    res.status(200).json({
                        developmentMessage: "Success"
                    });
                })
                .catch(function (err) {
                    next(err);
                })
        }

        function getSnippetID() {

            var sqlQuery = `SELECT snippet_id FROM pintext_snippets WHERE snippet_hash = $1`;

            pintextDatabaseClient
                .query(sqlQuery, [hashForSnippet])
                .then(insertUserSnippet)
                .catch(function (err) {
                    next(err);
                })
        }


    }

}