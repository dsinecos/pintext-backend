module.exports = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.write("You aren't logged in, you need to log in first");
        res.end();
    }
}