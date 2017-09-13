module.exports = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {

        var error = new Error();
        error = {
            status: 401,
            clientMessage: {
                code: '',
                type: '',
                developerMessage: 'Unauthorized',
                endUserMessage: 'Unauthorized'
            },
            serverMessage: {
                location: 'File - isAuthenticated.js',
                context: 'Unauthorized',
                error: null
            }
        }
        next(error);
    }
}