// CreativeMUD by whiskers75
// Licenced under the GPLv2.

var sockets = [];
var redis = require('redis');
var db = redis.createClient();
var players = [];
var repl = require('repl');
var net = require('net');
var len = 0;
var args;

var startsWith = function (superstr, str) {
  return !superstr.indexOf(str);
};
var login = function(name, socket, passcode, callback) { 
    db.get(name + ':name', function(err, res) {
        if (err) {
            return callback('Error: ' + err);
        }
        else {
            var res2 = res;
            db.get(name + ':pin', function(err, res) {
                if (err) {
                    return callback('Error: ' + err);
                }
                else if (name === res2) {
                    if (passcode === res) {
                        players[sockets.indexOf(socket)] = name;
                        return callback('Logged in as: ' + players[sockets.indexOf(socket)]);
                    }
                    else {
                        
                    }
                }
                else {
                    
                }
            });
        }
    });
};
var register = function(name, socket, passcode, callback) {
    if (name === null) {
        return callback('Name null!');
    }
    else if (name === '') {
        return callback('Name empty!');
    }
    else {
        db.get(name + ':name', function(error, res) {
            if (error) {
                return callback('Error: ' + error);
            }
            else if (res !== null) {
                return callback('This name has been taken!');
            }
            else {
                db.set(name + ':name', name, function(error) {
                    if (error) {
                        return callback('Error: ' + error);
                    }
                    else {
                        db.set(name + ':pin', passcode, function(error) {
                            if (error) {
                                return callback('Error: ' + error);
                            }
                            else {
                                players[sockets.indexOf(socket)] = name;
                                callback('Logged in as: ' + players[sockets.indexOf(socket)]);
                            }
                        });
                    }
                });
            }
        });
    }
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
        'input': socket,
        'output': socket,
        'eval': function(cmd, context, filename, callback) {
            cmd = cmd.replace("\n)","").replace("(","");
            console.log(cmd);
            args = cmd.split(" ");
            
            if (startsWith(cmd, 'login')) {
                login(args[1], socket, args[2], function(data) {
                    callback(null, data);
                });
            }
            if (startsWith(cmd, 'register')) {
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




