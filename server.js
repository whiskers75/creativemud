// CreativeMUD by whiskers75
// Licenced under the GPLv2.

var sockets = [];
var redis = require('redis');
var db = redis.createClient();
var players = [];
var repl = require('repl');
var net = require('net');
var len = 0;
var waiting = false;
var waitingFor = -1;
var waitingType = '';
var wait = 0;
var nnames = [];
var read;
var n;
var go = 0;
var finish;


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
                callback(null, 'Saves are automatic.');
            }
            // put new commands here...
            else { 
                if(wait === 0) {
                    if (cmd !== '') {
                        if (waiting) {
                            if (waitingFor === socket) {
                                if (waitingType === 'login') {
                                    if (db.get(cmd + ':pin') === null) {
                                        callback(null, 'Error (maybe this user does not exist?)');
                                    }
                                    else {
                                        db.get(cmd + ':pin', function(data){
                                            read = data;
                                            go += 1;
                                            if (go === 2) {
                                                finish();
                                            }
                                        });
                                        db.get(cmd + ':name', function(data) {
                                            n = data;
                                            go += 1;
                                            if (go === 2) {
                                                finish();
                                            }
                                        });
                                        finish = function() {
                                            callback(null, 'Please enter PIN.');
                                            waitingType = 'pin';
                                            wait = 1;
                                            go = 0;
                                        };
                                    }
                                }
                                if (waitingType === 'pin') {
                                    if (wait === 0) {
                                        if (cmd === read) {
                                            waiting = false;
                                            waitingFor = -1;
                                            waitingType = 'none';
                                            callback(null, 'Done!');
                                            players[sockets.indexOf(socket)] = n;
                                            callback(null, 'Logged in as: '+ players[sockets.indexOf(socket)]);
                                        }
                                        else {
                                            callback(null, 'PIN incorrect');
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
                                        db.set(cmd + ':pin', nnames[sockets.indexOf(socket)]);
                                        db.set(cmd + ':name', cmd);
                                        players[sockets.indexOf(socket)] = db.get(cmd + ':name');
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
    }}}).on('exit', function() {
        socket.end();
        len = len - 1;
    });
}).listen(5001);




