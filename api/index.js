var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.status(200).json({
        data: 'API Active. Request received'
    })
  
});

module.exports = router;
