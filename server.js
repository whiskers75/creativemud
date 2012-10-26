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
var version = "Alpha0.2";
var log = function(data) {
    console.log(data);
    // Will add file logging later
};
db.auth(password, function() { // For auth, comment out if not needed..
    console.log('Auth\'d');
    db.on('error', function(err) {
        console.error('Database Error: '+ err);
        process.exit(1);
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
var doesNameExist = function(name) {
    db.get(name + ':name', function(err,res) {
        if (err) {
            return 'Error';
        }
        else {
            if (res === null) {
                return false;
            }
            else {
                return true;
            }
        }
    });
};

var login = function(name, socket, passcode) { 
    db.get(name + ':name', function(err, res) {
        if (err) {
            return 'Error: ' + err;
        }
        else {
            var res2 = res;
            db.get(name + ':pin', function(err, res) {
                if (err) {
                    return 'Error: ' + err;
                }
                else if (name === res2) {
                    if (passcode === res) {
                        players[sockets.indexOf(socket)] = name;
                        return 'Logged in as: ' + players[sockets.indexOf(socket)];
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

var mkPrompt = function(user) {
    // Prompt maker, will edit later
    return 'CreativeMUD Alpha0.2>';
};

var register = function(name, socket, passcode) {
    if (name === null) {
        return 'Name null!';
    }
    else if (name === '') {
        return 'Name empty!';
    }
    else {
        db.get(name + ':name', function(error, res) {
            if (error) {
                return'Error: ' + error;
            }
            else if (res !== null) {
                return 'This name has been taken!';
            }
            else {
                db.set(name + ':name', name, function(error) {
                    if (error) {
                        return 'Error: ' + error;
                    }
                    else {
                        db.set(name + ':pin', passcode, function(error) {
                            if (error) {
                                return 'Error: ' + error;
                            }
                            else {
                                players[sockets.indexOf(socket)] = name;
                                init(players[sockets.indexOf(socket)]);
                                return 'Logged in as: ' + players[sockets.indexOf(socket)];
                            }
                        });
                    }
                });
            }
        });
    }
};

net.createServer(function (socket) {
    socket.write('Welcome to CreativeMUD, version '+version+'.\nThere are currently '+ len + ' players logged in.\nTo exit CreativeMUD, type \'.exit\'.\nIf CreativeMUD seems to freeze, type \'.break\'.\nType \'help\' for help.\n');
    socket.write('What is your name?');
    socket.setEncoding('utf-8');
    socket.setTimeout(300000);
    socket.on('timeout', function() {
        socket.write('Timed out after 5 minutes.');
        socket.end();
        len = len - 1;
    });
    sockets.push(socket);
    socket.once('data', function(data) {
        if (data === null) {
            socket.write('Goodbye.');
            socket.end();
        }
        else {
            if (!doesNameExist(data)) {
                socket.write('It looks like that might be a new name. Would you like to register? (y/n)');
                socket.once('data', function(data2) {
                    if (data2 === 'y') {
                        socket.write('Well then. Please enter a passcode.');
                        socket.once('data', function(data3) {
                            socket.write(register(data, socket, data3));
                            socket.write('Welcome to CreativeMUD.');
                        });
                    }
                    else {
                        socket.write('Goodbye.');
                        socket.end();
                    }
                });
            }
            else {
                if (doesNameExist(data)) {
                    if (doesNameExist(data) !== 'Error') {
                        socket.write('Welcome back, '+data+'. What is your passcode?');
                            socket.once('data', function(data4) {
                                login(data, socket, data4);
                            });
                    }
            }
        }
    }
    // DEPRECATED:
    // players[sockets.indexOf(socket)] = 'none';
    len = len + 1;
    socket.write(mkPrompt(players[sockets.indexOf(socket)]));
    repl.start({
        prompt: "", // Uses mkprompt() now
        'input': socket,
        'output': socket,
        'writer': function(object) {
            return object;
        },
        'eval': function(cmd, context, filename, callback) {
            cmd = cmd.replace("\n)","").replace("(","");
            // console.log(cmd);
            args = cmd.split(" ");
            // DEPRECATED:
            //if (startsWith(cmd, 'login')) {
            //    login(args[1], socket, args[2], function(data) {
            //        callback(null, data);
            //    });
            //}
            //if (startsWith(cmd, 'logout')) {
            //    players[sockets.indexOf(socket)] = 'none';
            //    callback(null, 'Logged out');
            //}
            //if (startsWith(cmd, 'register')) {
            //    register(args[1], socket, args[2], function(data) {
            //        callback(null, data);
            //    });
            //}
            if (cmd === "look") {
                callback(null, getAreaMetadata(getArea(players[sockets.indexOf(socket)]), 'title') + '\n' + getAreaMetadata(getArea(players[sockets.indexOf(socket)]), 'desc'));
            }
            if (cmd === "save") {
                callback(null, 'Saves are automatic.');
            }
            if (cmd === "quit") {
                socket.end();
            }
            if (cmd === "help") {
                callback(null, 'Help\nLook with look\nQuit with quit');
            }
            // put new commands here...
            socket.write(mkPrompt(players[sockets.indexOf(socket)]));
    }}).on('exit', function() {
        socket.end();
        len = len - 1;
    });
}).listen(5001);




