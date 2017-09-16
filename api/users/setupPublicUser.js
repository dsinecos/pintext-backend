var pintextDatabaseClient = require('../../db/index.js');
var insertNewUser = require('./insertNewUser');

// Create public user
// module.exports = function() {
//     console.log('Hoye');
// }

(function() {

    // console.log("This is executing");
    checkIfPublicUserAlreadyExists();

    function checkIfPublicUserAlreadyExists() {

        var sqlQuery = `SELECT EXISTS (SELECT 1 FROM pintext_users WHERE username = $1)`;
        var publicUsername = "publicUser";

        pintextDatabaseClient.query(sqlQuery, [publicUsername]).then(function(result) {
            // console.log(result);
            var doesPublicUserAlreadyExist = result[0].exists;
            if(doesPublicUserAlreadyExist) {

            } else {
                createPublicUser();
            }
        }).catch(function(err) {
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
                    location: 'File - setupPublicUser.js, Function - checkIfPublicUserAlreadyExists',
                    context: 'Checking if public user already exists in the user table',
                    error: err
                }
            }
            console.log(error);
        });

    }

    function createPublicUser() {

        var saltRounds = 10;
        var username = "publicUser";
        var password = "publicpintext";
        
        function respondUser(responseForUser) {
            console.log("Public " + JSON.stringify(responseForUser, null, "  "));
        }

        insertNewUser(saltRounds, username, password, respondUser, null);
    }

}())