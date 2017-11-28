var app = require('./app.js');

var PORT = process.env.PORT || 2348;

app.listen(PORT, notifyServerStartedOnConsole(PORT));

function notifyServerStartedOnConsole(PORT) {
    console.log("Server started on PORT : " + PORT);
}
