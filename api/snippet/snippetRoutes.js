var express = require('express');
var router = express.Router();
var isAuthenticated = require('../users/isAuthenticated.js');
// var validateSnippetData = require('./validateSnippetData.js');

var addSnippet = require('./addSnippet.js');
// var editSnippet = require('./editSnippet.js');
// var getSnippet = require('./getSnippet.js');
// var getAllSnippets = require('./getAllSnippets.js');

router.post('/', addSnippet);
// router.post('/:hash',isAuthenticated, editSnippet);
// router.get('/:hash', getSnippet);
// router.get('/',isAuthenticated, getAllSnippets);

router.get('/', function(req, res, next) {
    res.send("Hoila");
    console.log("Jamoila");
});

module.exports = router;
