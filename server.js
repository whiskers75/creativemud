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
var args;
var startsWith = function (superstr, str) {
  return !superstr.indexOf(str);
};
var login = function(name, socket, passcode, callback) { 
    db.get(name + ':name', function(data) {
        if (data === null) {
            callback('Record not found!');
        }
        else {
            db.get(name + ':pin', function(pin) {
                if (name === data) {
                    if (passcode === pin) {
                        players[sockets.indexOf(socket)] = name;
                        callback('Logged in as: ' + players[sockets.indexOf(socket)]);
                    }
                    else {
                        callback('Not matched.');
                    }
                }
                else {
                    callback('Not matched.');
                }
            });
        }
    });
};
var register = function(name, socket, passcode, callback) {
    if (name === null) {
        callback('Name null!');
        return;
    }
    if (name === '') {
        callback('Name empty!');
        return;
    }
    db.get(name + ':name', function(data) {
        if (data !== null) {
            callback('This name has been taken!');
        }
        else {
            db.set(name + ':name', name, function() {
                db.set(name + ':pin', passcode, function() {
                    players[sockets.indexOf(socket)] = name;
                    callback('Logged in as: ' + players[sockets.indexOf[socket]);
                });
            });
        }
    });
};

db.on('error', function(err) {
    console.log('Database Error: '+ err);
});


net.createServer(function (socket) {
    socket.write('Welcome to CreativeMUD, version 0.0.1!\nThere are currently '+ len + ' players logged in.\nTo exit CreativeMUD, type \'.exit\'.\nIf CreativeMUD seems to freeze, type \'.break\'.\nType \'help\' for help.\n');
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
            args = cmd.split(" ");
            
            if (startsWith(cmd, 'login')) {
                console.log('login');
                login(args[1], socket, args[2], function(data) {
                    callback(null, data);
                });
            }
            if (startsWith(cmd, 'login')) {
                register(args[1], socket, args[2], function(data) {
                    callback(null, data);
                });
            }
            if (cmd === "save") {
                callback(null, 'Saves are automatic.');
            }
            if (cmd === "help") {
                callback(null, '');
                callback(null, 'Help');
                callback(null, 'Login with login [username] [pin]');
                callback(null, 'Register with register [username] [pin]');
            }
            // put new commands here...
    }}).on('exit', function() {
        socket.end();
        len = len - 1;
    });
}).listen(5001);




