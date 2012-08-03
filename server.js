// CreativeMUD by whiskers75
// Licenced under the GPLv2.

var sockets = [];
var players = [];
var repl = require('repl');
var net = require('net');
var fs = require('fs');
var len = 0;
var waiting = false;
var waitingFor = -1;
var waitingType = '';
var wait = 0;
var users = require('./users.json');
var nnames = [];
var regs = 0;
var items = require('./items.json');
var owners = require('./owners.json');
var areas = require('./areas.json');
var file;


net.createServer(function (socket) {
    socket.write('Welcome to CreativeMUD, version 0.0.1!\nThere are currently '+ len + ' players logged in.\nTo exit CreativeMUD, type \'.exit\'.\n');
    sockets.push(socket);
    players[sockets.indexOf(socket)] = 'none';
    len = len + 1;
    repl.start({
        prompt:"CreativeMUD, socket "+ sockets.indexOf(socket)+"> ",
        input: socket,
        output: socket,
        'eval': function(cmd, context, filename, callback){
            cmd = cmd.replace("\n)","").replace("(","");
            console.log(cmd);
            if (cmd === "login") {
                console.log('login');
                if (waiting) {
                    callback(null, 'Please wait a moment and try again.');
                }
                if (!waiting) {
                    callback(null, 'Please enter PIN.');
                    waiting = true;
                    waitingFor = socket;
                    waitingType = 'login';
                    wait = 1;
                }
            }
            if (cmd === "register") {
                if (waiting) {
                    callback(null, 'Please wait a moment and try again.');
                }
                if (!waiting) {
                    callback(null, 'Please enter desired PIN.');
                    waiting = true;
                    waitingFor = socket;
                    waitingType = 'register';
                    wait = 1;
                }
            }
            if (cmd === "save") {
                fs.writeFileSync('./items.json', JSON.stringify(items), 'utf-8');
                fs.writeFileSync('./areas.json', JSON.stringify(areas), 'utf-8');
                fs.writeFileSync('./owners.json', JSON.stringify(owners), 'utf-8');
                fs.writeFileSync('./users.json', JSON.stringify(users), 'utf-8');
                callback(null, 'Save complete.');
            }
            // put new commands here...
            else { 
                if(wait === 0) {
                    if (cmd !== '') {
                        if (waiting) {
                            if (waitingFor === socket) {
                                if (waitingType === 'login') {
                                    players[sockets.indexOf(socket)] = users[cmd];
                                    waiting = false;
                                    waitingFor = -1;
                                    waitingType = 'none';
                                    callback(null, 'Done!');
                                    callback(null, 'Logged in as: '+ players[sockets.indexOf(socket)]);
                                }
                                if (waitingType === 'register') {
                                    if (users[cmd] !== undefined) {
                                        callback(null, 'This PIN is taken. Please try again.');
                                    }
                                    else {
                                        nnames[sockets.indexOf(socket)] = cmd;
                                        waitingType = 'username';
                                        wait = 0;
                                    }
                                }
                                if (waitingType === 'username') {
                                    if (wait === 0) {
                                        regs += 1;
                                        users[nnames[sockets.indexOf(socket)]] = regs;
                                        callback(null, 'Registered.');
                                        players[sockets.indexOf(socket)] = users[cmd];
                                        waiting = false;
                                        waitingFor = -1;
                                        waitingType = 'none';
                                        callback(null, 'Logged in as: '+ players[sockets.indexOf(socket)]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            wait = 0;
    }}).on('exit', function() {
        socket.end();
        len = len - 1;
    });
}).listen(5001);




