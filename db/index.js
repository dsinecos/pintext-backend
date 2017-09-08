// TO DO
// Export connection from a pool for the scalability of the app?

var pgp = require('pg-promise')();
var connectionString = process.env.DATABASE_URL || "pg://admin:guest@localhost:5432/pintext";
var pintextDatabaseClient = pgp(connectionString);

module.exports = pintextDatabaseClient;

// To check if a connection to the database has been made by pintextDatabaseClient

// pintextDatabaseClient.proc('version')
// .then(function(data) {
//     console.log("Connection to database pintext success");
// })
// .catch(function(error) {
//     console.log("Connection to database pintext failed")
//     console.log("Error -> ");
//     console.log(error);
// });
