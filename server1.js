// CreativeMUD by whiskers75
// Licenced under the GPLv2.



var sockets = [];
var players = [];
var repl = require('repl');
var net = require('net');
var len = 0;
var waiting = false;
var waitingFor = -1;
var waitingType = '';
var users = [];
var nnames = [];
var result;


net.createServer(function (socket) {
    socket.write('Welcome to CreativeMUD, version 0.0.1!\nThere are currently '+ len + ' players logged in.\nTo exit CreativeMUD, type \'.exit\'.\n');
    sockets.push(socket);
    players[sockets.indexOf(socket)] = 'none';
    len = len + 1;
    repl.start({
        prompt:"CreativeMUD, player "+ players[sockets.indexOf(socket)]+"> ",
        input: socket,
        output: socket,
        'eval': function(cmd, context, filename, callback){
        cmd = cmd.trim();
        console.log(cmd);
        if (cmd === 'login') {
            while (waiting) {
                if (!waiting) {
                    result = ('Please enter PIN.\n');
                    waiting = true;
                    waitingFor = socket;
                    waitingType = 'login';
                    }
            }
            if (!waiting) {
                result = ('Please enter PIN.\n');
                waiting = true;
                waitingFor = socket;
                waitingType = 'login';
            }
        }
        if (cmd === 'register') {
            while (waiting) {
                if (!waiting) {
                    result = ('Please enter desired PIN.\n');
                    waiting = true;
                    waitingFor = socket;
                    waitingType = 'login';
                    }
            }
            if (!waiting) {
                result = ('Please enter desired PIN.\n');
                waiting = true;
                waitingFor = socket;
                waitingType = 'login';
            }
        }
        // put new commands here...
        else {
            if (cmd !== '') {
                if (waiting) {
                    if (waitingFor === socket) {
                        if (waitingType === 'login') {
                            players[sockets.indexOf(socket)] = users[cmd];
                            waiting = false;
                            waitingFor = -1;
                            waitingType = 'none';
                        }
                        if (waitingType === 'register') {
                            if (users[cmd] !== undefined) {
                                result = ('This PIN is taken. Please try again.');
                            }
                            else {
                                nnames[sockets.indexOf(socket)] = cmd;
                                result = ('Please enter a username.');
                                waitingType = 'username';
                            }
                        }
                        if (waitingType === 'username') {
                            users[nnames[sockets.indexOf(socket)]] = cmd;
                            result = ('Registered.');
                        }
                    }
                }
            }
        }
        callback(null, result);
    }}).on('exit', function() {
        socket.end();
        len = len - 1;
    });
}).listen(5001);




