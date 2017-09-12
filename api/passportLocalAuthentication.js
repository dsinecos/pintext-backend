var Strategy = require("passport-local").Strategy;
var pg = require('pg');
var bcrypt = require('bcrypt');
var pintextDatabaseClient = require('../db/index.js');

module.exports = function (passport) {

    passport.use(new Strategy(
        function (username, password, cb) {
            
            findByUsername(username, function (err, user) {
                if (err) { return cb(err); }
                if (!user) { return cb(null, false); }
                
                bcrypt.compare(password, user.password).then(function (result) {
                    if(result) {
                        return cb(null, user);
                    } else {
                        return cb(null, false);
                    }
                }).catch(function(err) {
                    res.status(500).send("Internal server error ");
                    res.end();
                    console.log("Error while using bcrypt to compare the user entered password with the hash in the database. Following is the error");
                    console.log(err);
                });                
            });
        }));

    function findByUsername(username, fn) {
        var sqlQuery = `SELECT *
                    FROM pintext_users
                    WHERE username=$1`;

        pintextDatabaseClient.query(sqlQuery, [username])
        .then(function(result) {
            console.log(result[0]);
            console.log('\n');
            fn(null, result[0]);
        })
        .catch(function(error){
            fn(error, null);
        });
        
    }

    passport.serializeUser(function (user, cb) {
        cb(null, user.user_id);
    });

    passport.deserializeUser(function (id, cb) {
        findByID(id, function (err, user) {
            if (err) { return cb(err); }
            cb(null, user);
        });
    });

    function findByID(id, fn) {
        var sqlQuery = `SELECT *
                    FROM pintext_users
                    WHERE user_id=$1`;

        // pintextDatabaseClient.query(sqlQuery, [id], returnedID);

        pintextDatabaseClient.query(sqlQuery, [id])
        .then(function(result) {
            fn(null, result[0]);
        })
        .catch(function(error) {
            fn(error, null);
        });

        // function returnedID(err, result) {
        //     fn(err, result.rows[0]);
        // }
    }

}

