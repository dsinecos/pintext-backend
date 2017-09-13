var joi = require('joi');

module.exports = function (req, res, next) {

    const schema = joi.object().keys({
        username: joi.string().required().alphanum().min(3).max(30),
        password: joi.string().required().alphanum().min(8)
    });

    var validationResult = new Promise(function (resolve, reject) {

        var result = joi.validate({ username: req.body.username, password: req.body.password }, schema);
        if (result.error === null) {    
            resolve(result);
        } else {
            reject(result.error);
        }
    });

    validationResult.then(function(result) {
        next();
    }).catch(function (error) {
        next(error);        
    });
}

