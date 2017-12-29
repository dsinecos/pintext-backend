var util = require("util");

module.exports = function(error, req, res, next) {
    console.log(error);
    res.status(500).json({
        developmentMessage: 'Failed'
    });

    next();
}

/*
var error = new Error();
error = {
    status: 404,
    clientMessage: {
        code: 'XXX',
        type: 'Type of error',
        developerMessage: 'Message for Developer using the API',
        endUserMessage: 'Message for the end-user using the application'
    },
    serverMessage: {
        location: 'File, Route, Function where the error originates from',
        context: 'What action was attempted that led to this error',
        error: 'Attach the error thrown here'
    }
}
next(error);
*/