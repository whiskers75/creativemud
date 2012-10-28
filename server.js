// CreativeMUD by whiskers75
// Licenced under the GPLv2.


var sockets = [];
var Stream = require('stream');
var redis = require('redis');
var db = redis.createClient(9033, 'sole.redistogo.com'); 
var players = [];
var repl = require('repl');
var net = require('net');
var len = 0;
var args;
var nameLogins = [];
var password = require('../config.js');
var version = "Beta0.1";
var readlines = [];
var rl = require('readline');

var log = function(data) {
    console.log(data);
    // Will add file logging later
};
db.auth(password, function() { // For auth, comment out if not needed..
    log('Auth\'d');
    db.on('error', function(err) {
        console.error('Database Error: '+ err);
        process.exit(1);
    });
});
var getAttr = function(player, attr, callback) {
    db.get(player + ':'+ attr, function(err, res) {
        if(err) {
            callback(false);
        }
        else {
            callback(res);
        }
    });
};

var setAttr = function(player, attr, val, callback) {
    db.set(player + ':'+ attr, val, function(err, res) {
    if (err) {
        callback(false);
    }
    if (!err) {
        callback(true);
    }
    });
};
var init = function(player) {
    setAttr(player, 'area', '0', function() {
        setAttr(player, 'hp', '100', function() {
            setAttr(player, 'maxHP', '100', function() {
            setAttr(player, 'imm', 'false', function() {});
            });
        });
    });
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

var mkPrompt = function(user, callback) {
    // Prompt maker, will edit later
    getAttr(user, 'hp', function(hp) {
        getAttr(user, 'maxHP', function(max) {
            callback('C:'+hp+'/'+max+'>');
        });
    });
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
    sockets.push(socket);
    var streams = [];
    streams[sockets.indexOf(socket)] = require('through');

    socket.on('connect', function(socket) {
        log('Socket '+sockets.indexOf(socket)+' connected.');
    });
    socket.setEncoding('utf-8');
    socket.on('error', function() {
        socket.write('Error\n');
        socket.end();
    });
    readlines[sockets.indexOf(socket)] = rl.createInterface({
        input: socket,
        output: socket
    });
    readlines[sockets.indexOf(socket)].on('SIGINT', function() {
        socket.end();
    });
    readlines[sockets.indexOf(socket)].setPrompt('', 0);
    socket.write('Welcome to CreativeMUD, version '+version+'.\nThere are currently '+ len + ' players logged in.\nTo exit CreativeMUD, type \'.exit\'.\nIf CreativeMUD seems to freeze, type \'.break\'.\nType \'help\' for help.\n');
    readlines[sockets.indexOf(socket)].question('With what name do you go by in the realm of the Creative Multi User Dungeon?\n', function(answer) {
        answer = answer.replace(/[\n\r]/g, '');
        log('Checking '+answer+' for name existence');
        nameLogins[sockets.indexOf(socket)] = answer;
        if (answer === '') {
            log('Disconnecting '+ sockets.indexOf[socket]);
            readlines[sockets.indexOf(socket)].write('Invalid Name.\n');
            readlines[sockets.indexOf(socket)].end();
            socket.end();
        }
        else { // LOGIN WORKS
            db.get(answer + ':name', function(err,res) {
                answer = res;
                if (answer === null) {
                log(answer+' does not exist, starting register on socket '+ sockets.indexOf(socket));
                socket.pause();
                socket.resume();
                
                socket.write('It looks like that is a new name, would you like to register? (y/n)\n');
                readlines[sockets.indexOf(socket)].once('line', function(answer2) {
                    socket.pause();
                    answer2 = answer2.replace(/[\n\r]/g, '');
                    socket.resume();
                    log(answer2);
                    if (answer2 === 'y') {
                        readlines[sockets.indexOf(socket)].question('Good! Please enter a password.\n', function(answer3) {
                            answer3.replace(/[\n\r]/g, '');
                            log('Registering '+sockets.indexOf(socket)+'.');
                            readlines[sockets.indexOf(socket)].write(register(nameLogins[sockets.indexOf(socket)], socket, answer3));
                            log('Registered '+sockets.indexOf(socket)+'.');
                            readlines[sockets.indexOf(socket)].write('Welcome to CreativeMUD.\n');
                            startREPL();
                        });
                    }
                    else {
                        readlines[sockets.indexOf(socket)].write('Goodbye.\n');
                        socket.end();
                    }
                });
            }
            else {
                if (answer == nameLogins[sockets.indexOf(socket)]) {
                    if (answer != 'Error') {
                        socket.write('Welcome back, '+nameLogins[sockets.indexOf(socket)]+'. What is your password?\n');
                        readlines[sockets.indexOf(socket)].once('line', function(answer4) {
                            answer4.replace(/[\n\r]/g, '');
                            log('Logging in '+sockets.indexOf(socket)+' as '+nameLogins[sockets.indexOf(socket)]);
                            if (login(nameLogins[sockets.indexOf(socket)], socket, answer4) === null) {
                                readlines[sockets.indexOf(socket)].write('Wrong password, or password error.\n');
                                socket.end();
                            }
                            else {
                                readlines[sockets.indexOf(socket)].write(login(nameLogins[sockets.indexOf(socket)], socket, answer4));
                                startREPL();
                            }
                        });  
                    }
                }
            }
            });   
        }
    });
    // DEPRECATED:
    // players[sockets.indexOf(socket)] = 'none';
    len = len + 1;
    var startREPL = function() {
            mkPrompt(players[sockets.indexOf(socket)], function(result) {
                socket.write(result);
            });
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
                    getAttr(sockets.indexOf(socket), 'area',  function(area) {
                        getAttr('area_'+area, 'title', function(title) {
                            getAttr('area_'+area, 'desc', function(desc) {
                                callback(null, title+'\n'+desc);
                            });
                        });
                    });
                }
                
                /*if (cmd === "save") {
                    callback(null, 'Saves are automatic.');
                }*/
                if (cmd === "quit") {
                    socket.write('Farewell.');
                    socket.end();
                    socket.destroy();
                }
                if (cmd === "help") {
                    callback(null, 'Help\nQuit with quit');
                }
                if (startsWith(cmd, "init")) {
                    getAttr(players[sockets.indexOf(socket)], 'imm', function(imm) {
                        if (imm == "true") {
                            init(args[1]);
                        }
                        if (imm === "false") {
                            callback(null, 'Nice try, mere mortal!');
                        }
                    });
                }
                // put new commands here...
                mkPrompt(players[sockets.indexOf(socket)], function(result) {
                    socket.write(result);
                });
        }}).on('exit', function() {
            socket.end();
            len = len - 1;
        });
    };
}).listen(5001);
// End CreativeMUD.