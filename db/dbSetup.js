// TO DO
// How to create the database connection in a pool and not via individual connections for scalability of app?
// Resolve deadlock (AccessExclusiveLock) situation when dropping tables (Why is it periodic, happens once when I run the program, doesn't happen the next time?)
// Move connectionString to configuration file

var pgp = require('pg-promise')();
var connectionString = process.env.DATABASE_URL || "pg://admin:guest@localhost:5432/pintext";
var pintextDatabaseClient = pgp(connectionString);

function runSQLQuery(databaseQuery) {
    return pintextDatabaseClient.query(databaseQuery);
}

function tableCreationComplete(data) {
    console.log("Table creation complete");
    process.exit();
}

var queryToDropUserTable = "DROP TABLE IF EXISTS pintext_users CASCADE";
var queryToDropSnippetTable = "DROP TABLE IF EXISTS pintext_snippets CASCADE";
var queryToDropUserSnippetTable = "DROP TABLE IF EXISTS pintext_usersnippet CASCADE";

var queryToDropTables = [queryToDropUserTable, queryToDropSnippetTable, queryToDropUserSnippetTable];

var queryToDropTablesPromises = queryToDropTables.map(function(databaseQuery) {
    return runSQLQuery(databaseQuery);
});

Promise.all(queryToDropTablesPromises)
.then(function(data) {
    console.log("Existing tables dropped");
    generateTables();
})
.catch(function(error) {
    console.log("Error dropping existing tables");
    console.log(error);
});

function generateTables() {

    var queryToGenerateUserTable = "CREATE TABLE IF NOT EXISTS pintext_users(user_id SERIAL PRIMARY KEY, username varchar(128) NOT NULL UNIQUE, password varchar(256) NOT NULL)";
    var queryToGenerateSnippetTable = "CREATE TABLE IF NOT EXISTS pintext_snippets(snippet_id SERIAL PRIMARY KEY, snippet_title varchar(512) NOT NULL, snippet_reference varchar(512), snippet_content text NOT NULL, snippet_created_on date NOT NULL, snippet_updated_on date, snippet_hash varchar(64) NOT NULL UNIQUE)";
    var queryToGenerateUserSnippetTable = "CREATE TABLE IF NOT EXISTS pintext_usersnippet(usersnippet_id SERIAL PRIMARY KEY, user_id int, FOREIGN KEY (user_id) REFERENCES pintext_users(user_id), snippet_id int NOT NULL, FOREIGN KEY (snippet_id) REFERENCES pintext_snippets(snippet_id), view_for_all BOOLEAN NOT NULL)";

    var primaryTables = [queryToGenerateUserTable, queryToGenerateSnippetTable];
    var secondaryTables = [queryToGenerateUserSnippetTable];

    var primaryTablesPromises = primaryTables.map(function (databaseQuery) {
        return runSQLQuery(databaseQuery);
    });

    Promise.all(primaryTablesPromises)
    .then(function (data) {

        var secondaryTablesPromises = secondaryTables.map(function (databaseQuery) {
            return runSQLQuery(databaseQuery);
        });

        Promise.all(secondaryTablesPromises)
        .then(tableCreationComplete)
        .catch(function (error) {
            console.log("Error creating secondary tables");
            console.log(error);
        });

    })
    .catch(function (error) {
        console.log("Error creating primary tables");
        console.log(error);
    });
}

