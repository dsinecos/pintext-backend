var joi = require('joi');

module.exports = function (req, res, next) {

    const schema = joi.object().keys({
        username: joi.string().required().alphanum().min(3).max(30),
        password: joi.string().required().alphanum().min(1)
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
    }).catch(function (err) {

        var error = new Error();
        error = {
            status: 400,
            clientMessage: {
                code: '',
                type: '',
                developerMessage: 'Input failed validation criteria. Please revise input and try',
                endUserMessage: 'Input failed validation criteria. Please revise input and try'
            },
            serverMessage: {
                location: 'File - validateUserData.js',
                context: 'Input validation failed',
                error: err
            }
        }
        next(error);

    });
}

