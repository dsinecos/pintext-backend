var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if ( !req.session.views){
    req.session.views = 1;
  }else{
    req.session.views += 1;
  }

  res.json({
    "status" : "ok",
    "frequency" : req.session.views
  });
  res.end();

  next();
});

module.exports = router;
