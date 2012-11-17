// CreativeMUD by whiskers75
// Licenced under the GPLv2.


var sockets = [];
var fs = require('fs');
var Stream = require('stream');
var colorize = require('colorize');
var redis = require('redis');
var db = redis.createClient(9033, 'sole.redistogo.com'); 
var players = [];
var repl = require('repl');
var net = require('net');
var len = 0;
var args;
var nameLogins = [];
var password = require('../config.js');
var version = "Beta0.2";
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
            callback(colorize.ansify(res));
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

var delInventory = function(player, data, callback) {
    db.srem(player+':inv', data, function(err, res) {
        if (err) {
            callback(false);
        }
        if (!err) {
            if (res === true) {
                callback(true);
            }
            if (res === false) {
                callback(false);
            }
        }
    });
};

var addInventory = function(player, data, callback) {
    db.sadd(player+':inv', data, function(err) {
        if (err) {
            callback(false);
        }
        if (!err) {
            callback(true);
        }
    });
};

var getInventory = function(player, callback) {
    db.smembers(player+':inv', function(err) {
        if (err) {
            callback(false);
        }
        if (!err) {
            callback(true);
        }
    });
};
/* OBSOLETE
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
*/
var startsWith = function (superstr, str) {
  return !superstr.indexOf(str);
};

var login = function(name, socket, passcode, callback) { 
    db.get(name + ':name', function(err, res) {
        if (err) {
            callback('Error: ' + err);
        }
        else {
            var res2 = res;
            db.get(name + ':pin', function(err, res) {
                if (err) {
                    callback('Error: ' + err);
                }
                else if (name === res2) {
                    if (passcode === res) {
                        players[sockets.indexOf(socket)] = name;
                        callback('Logged in as: ' + players[sockets.indexOf(socket)]);
                    }
                    else {
                        socket.write('Wrong Password.');
                        socket.end();
                        socket.destroy();
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
            callback(colorize.ansify('#green['+user+'] #red['+hp+']/'+max+'HP>'));
        });
    });
};

var register = function(name, socket, passcode, callback) {
    if (name === null) {
        callback('Name null!');
    }
    else if (name === '') {
        callback('Name empty!');
    }
    else {
        db.get(name + ':name', function(error, res) {
            if (error) {
                callback('Error: ' + error);
            }
            else if (res !== null) {
                callback('This name has been taken!');
            }
            else {
                db.set(name + ':name', name, function(error) {
                    if (error) {
                        callback('Error: ' + error);
                    }
                    else {
                        db.set(name + ':pin', passcode, function(error) {
                            if (error) {
                                callback('Error: ' + error);
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
    fs.readFile('./motd.txt', 'utf8', function(err, data) {
        if (err) {
            console.log('CANNOT READ MOTD!');
            process.exit(1);
        }
        socket.write(colorize.ansify(data));
        loginPrompt();
    });
    var loginPrompt = function() {
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
                            register(nameLogins[sockets.indexOf(socket)], socket, answer3, function(res) {
                                log('Registered '+sockets.indexOf(socket)+'.');
                                readlines[sockets.indexOf(socket)].write('Welcome to CreativeMUD.\n');
                                startREPL();
                            });
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
                            login(nameLogins[sockets.indexOf(socket)], socket, answer4, function(res) {
                                readlines[sockets.indexOf(socket)].write('Logged you in, '+ nameLogins[sockets.indexOf(socket)]+ '.');
                                startREPL();
                            });
                        });  
                    }
                }
            }
            });   
        }
    });
    };
    // DEPRECATED:
    // players[sockets.indexOf(socket)] = 'none';
    len = len + 1;
    var startREPL = function() {
        setTimeout(function() {
        mkPrompt(players[sockets.indexOf(socket)], function(result) {
        socket.write(result);
        });
        }, 1000);
        repl.start({
            prompt: "", // Uses mkprompt() now
            'input': socket,
            'output': socket,
            'writer': function(object) {
                return colorize.ansify(object);
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
                    getAttr(players[sockets.indexOf(socket)], 'area',  function(area) {
                        getAttr('area_'+area, 'title', function(title) {
                            getAttr('area_'+area, 'desc', function(desc) {
                                getAttr('area_'+area, 'exits', function(exits) {
                                    callback(null, title+'\n'+desc+'\n'+exits);
                                    mkPrompt(players[sockets.indexOf(socket)], function(result) {
                                            socket.write(result);
                                    });
                                });
                            });
                        });
                    });
                }
                else {
                if (cmd === "save") {
                    callback(null, 'Saves are automatic.');
                    mkPrompt(players[sockets.indexOf(socket)], function(result) {
                        socket.write(result);
                    });
                }
                else {
                if (cmd === "quit") {
                    socket.write('Farewell.\n');
                    socket.end();
                    socket.destroy();
                }
                else {
                if (cmd === "who") {
                    callback(null, 'People Count: '+len);
                    mkPrompt(players[sockets.indexOf(socket)], function(result) {
                        socket.write(result);
                    });
                }
                else {
                if (cmd === "help") {
                    callback(null, 'Help\nLook with look\nMove with move\nQuit with quit');
                    mkPrompt(players[sockets.indexOf(socket)], function(result) {
                        socket.write(result);
                    });
                }
                else {
                if (startsWith(cmd, "move")) {
                    if (args[1] === "") {
                        callback(null, 'Usage: move (direction)');
                        mkPrompt(players[sockets.indexOf(socket)], function(result) {
                            socket.write(result);
                        });
                    }
                    else {
                        getAttr(players[sockets.indexOf(socket)], 'area', function(area) {
                            getAttr('area_'+area, args[1], function(moved_to) {
                                if (moved_to === null) {
                                    callback (null, 'You cannot go that way.');
                                    getAttr('area_' + area, 'exits', function(exits) {
                                        callback(null,'Current '+ exits);
                                    });
                                    mkPrompt(players[sockets.indexOf(socket)], function(result) {
                                        socket.write(result);
                                    });
                                }
                                else {
                                    setAttr(players[sockets.indexOf(socket)], 'area', moved_to, function(suc) {
                                        if (suc === true) {
                                            getAttr(players[sockets.indexOf(socket)], 'area', function(area) {
                                                getAttr('area_' + area, 'title', function(title) {
                                                    getAttr('area_' + area, 'desc', function(desc) {
                                                        getAttr('area_' + area, 'exits', function(exits) {
                                                            callback(null, title + '\n' + desc + '\n' + exits);
                                                            mkPrompt(players[sockets.indexOf(socket)], function(result) {
                                                                socket.write(result);
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    }
                    }
                    else {
                        if (startsWith(cmd, "init")) {
                            getAttr(players[sockets.indexOf(socket)], 'imm', function(imm) {
                        if (imm == "true") {
                            init(args[1]);
                            mkPrompt(players[sockets.indexOf(socket)], function(result) {
                                socket.write(result);
                            });
                        }
                        if (imm === "false") {
                            callback(null, 'Nice try, mere mortal!');
                        }
                    });
                
                    }
                    else {
                    if (cmd !== "") {
                        callback(null, "Unknown Command.");
                        mkPrompt(players[sockets.indexOf(socket)], function(result) {
                            socket.write(result);
                        });
                    }
                    if (cmd === "") {
                        callback(null, "");
                        mkPrompt(players[sockets.indexOf(socket)], function(result) {
                            socket.write(result);
                        });
                    }
                    
                    }
                    }
                }
                }
                }
                }
                }
                // put new commands here...
        }}).on('exit', function() {
            socket.end();
            len = len - 1;
        });
    };
}).listen(5001);
// End CreativeMUD.