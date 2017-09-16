var util = require("util");

module.exports = function(error, req, res, next) {
    
    if(error.status && error.clientMessage) {
        res.status(error.status).write(JSON.stringify(error.clientMessage, null, '  '));
        res.end();
    }
    console.log(error);
    console.log(JSON.stringify(error, null, '  '));

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