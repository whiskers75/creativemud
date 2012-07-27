// CreativeMUD worker

var server = require(server.js);
var sent;

function handle(command, socket) {
    if (command === 'look') {
            sent = 'Test';
    }
    server.send(sent, socket);
}

