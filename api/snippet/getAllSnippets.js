var pintextDatabaseClient = require('../../db/index.js');

module.exports = function (req, res, next) {
    // getUserID
    // Get all snippet_ids against that user_id
    // Extract all snippets
    // Return all snippets

    var user_id = req.user.user_id;
    var arrayOfSnippetIDs = [];

    var sqlQuery = `SELECT snippet_id FROM pintext_usersnippet WHERE user_id=$1`;

    pintextDatabaseClient.query(sqlQuery, [user_id]).then(function (result) {
        arrayOfSnippetIDs = result;
        extractAllSnippets();

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
                location: 'File - getAllSnippets.js, Route - GET /snippet/',
                context: 'Retrieving all the snippet_ids for the current user_id',
                error: err
            }
        }
        next(error);
    });

    function extractAllSnippets() {
        var extractedSnippetsArray = arrayOfSnippetIDs.map(function(item) {
            var snippet_id = item.snippet_id;
            var sqlQuery = `SELECT * FROM pintext_snippets WHERE snippet_id=$1`;

            return pintextDatabaseClient.query(sqlQuery, [snippet_id]);
        });

        Promise.all(extractedSnippetsArray).then(function(result) {
            // console.log(JSON.stringify(result, null, "  "));
            // res.status(200).send(JSON.stringify(result, null, "  "));

            var allSnippets = {};
            var index = 0;

            var snippetsAsJSON = result.map(function(item) {
                var singleSnippet = item.map(function(snippet) {
                    allSnippets['snippet ' + (index +1)]=snippet;
                    index++;
                    return;
                });
                return;
            });

            console.log(allSnippets);
            res.status(200).json(allSnippets);

        }).catch(function(err) {
            console.log(err);
        });

    }


}