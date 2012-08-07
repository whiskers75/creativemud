// CreativeMUD by whiskers75
// Licenced under the GPLv2.

var sockets = [];
var redis = require('redis');
var db = redis.createClient();
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
var items = require('./items.json');
var owners = require('./owners.json');
var areas = require('./areas.json');
var read;
var error;

db.on('error', function(err) {
    console.log('Database Error: '+ err);
});


net.createServer(function (socket) {
    socket.write('Welcome to CreativeMUD, version 0.0.1!\nThere are currently '+ len + ' players logged in.\nTo exit CreativeMUD, type \'.exit\'.\nIf CreativeMUD seems to freeze, type \'.break\'.\n');
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
                    callback(null, 'Please enter username.');
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
                db.set
            }
            // put new commands here...
            else { 
                if(wait === 0) {
                    if (cmd !== '') {
                        if (waiting) {
                            if (waitingFor === socket) {
                                if (waitingType === 'login') {
                                    try {
                                        read = require('./'+ cmd + '.json');
                                        read = JSON.parse(read);
                                    }
                                    catch (err) {
                                        console.log('Error: '+ err);
                                        callback(null, 'Error!');
                                        error = err;
                                    }
                                    if (!error) {
                                        callback(null, 'Plese enter PIN.');
                                        wait = 1;
                                        waitingType = 'pin';
                                    }
                                    if (error) {
                                        error = undefined;
                                    }
                                }
                                if (waitingType === 'pin') {
                                    if (wait === 0) {
                                        if (cmd === read.pin) {
                                            waiting = false;
                                            waitingFor = -1;
                                            waitingType = 'none';
                                            callback(null, 'Done!');
                                            callback(null, 'Logged in as: '+ players[sockets.indexOf(socket)]);
                                        }
                                    }
                                }
                                if (waitingType === 'register') {
                                    nnames[sockets.indexOf(socket)] = cmd;
                                    waitingType = 'username';
                                    callback(null, 'Please enter a username.');
                                    wait = 1;
                                }
                                if (waitingType === 'username') {
                                    if (wait === 0) {
                                        fs.writeFileSync('./'+ cmd + '.json', JSON.stringify({ pin:nnames[sockets.indexOf(socket)], name:cmd, admin:false }, null, 4), 'utf8');
                                        read = require('./'+ cmd + '.json');
                                        players[sockets.indexOf(socket)] = read.name;
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




