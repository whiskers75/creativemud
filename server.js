// CreativeMUD by whiskers75
// Licenced under the GPLv2.

var sockets = [];
var redis = require('redis');
var db = redis.createClient(9033, 'sole.redistogo.com'); 
var players = [];
var repl = require('repl');
var net = require('net');
var len = 0;
var args;
var password = require('../config.js');

db.auth(password, function() { // For auth, comment out if not needed..
    console.log('Auth\'d');
    db.on('error', function(err) {
        console.log('Database Error: '+ err);
    });
});
var getArea = function(player) {
    db.get(player + ':area', function(err, res) {
        if(err) {
            return false;
        }
        else {
            return res;
        }
    });
};
var setArea = function(player, area) {
    db.set(player + ':area', area, function(err, res) {
    if (err) {
        return false;
    }
    if (!err) {
        return true;
    }
    });
};
var init = function(player) {
    setArea(player, '0');
};

var getAreaMetadata = function(area, meta) {
    db.get('area_'+area+':'+meta, function(err, res) {
        if (err) {
            return false;
        }
        if (!err) {
            return res;
        }
    });
};

var setAreaMetadata = function(area, meta, val) {
    db.set('area_'+area+':'+meta, val, function(err, res) {
        if (err) {
            return false;
        }
        if (!err) {
            return true;
        }
    });
};

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
                                init(players[sockets.indexOf(socket)]);
                                callback('Logged in as: ' + players[sockets.indexOf(socket)]);
                            }
                        });
                    }
                });
            }
        });
    }
};

net.createServer(function (socket) {
    socket.write('Welcome to CreativeMUD, version 0.0.2!\nThere are currently '+ len + ' players logged in.\nTo exit CreativeMUD, type \'.exit\'.\nIf CreativeMUD seems to freeze, type \'.break\'.\nType \'help\' for help.\n');
    sockets.push(socket);
    players[sockets.indexOf(socket)] = 'none';
    len = len + 1;
    repl.start({
        prompt:"CreativeMUD, socket "+ sockets.indexOf(socket)+"> ",
        'input': socket,
        'output': socket,
        'writer': function(object) {
            socket.write(object);
            return true;
        },
        'eval': function(cmd, context, filename, callback) {
            cmd = cmd.replace("\n)","").replace("(","");
            // console.log(cmd);
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
            if (cmd === "quit") {
                socket.end();
            }
            if (cmd === "help") {
                callback(null, 'Help\nLogin with login [username] [pin]\nRegister with register [username] [pin]\nQuit with quit');
            }
            // put new commands here...
    }}).on('exit', function() {
        socket.end();
        len = len - 1;
    });
}).listen(5001);




