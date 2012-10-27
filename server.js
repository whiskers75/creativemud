// CreativeMUD by whiskers75
// Licenced under the GPLv2.

// START THROUGH CODE
var  write = function (data) { this.emit('data', data) }
var  end = function () { this.emit('end') }

  var ended = false, destroyed = false
  var stream = new Stream(), buffer = []
  stream.buffer = buffer
  stream.readable = stream.writable = true
  stream.paused = false  
  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift()
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data)
    }
  }

  stream.queue = function (data) {
    buffer.push(data)
    drain()
  }

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here. 
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if(!stream.readable)
      stream.destroy()
  }

  stream.end = function (data) {
    if(ended) return 
    ended = true
    if(arguments.length) stream.write(data)
    if(!buffer.length) _end()
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
  }

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true
    stream.emit('pause')
  }
  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
    }
    drain()
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain')
  }
// END THROUGH CODE


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
var version = "Alpha0.2";
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
    sockets.push(socket);
    var streams = [];
    streams[sockets.indexOf(socket)] = stream;

    socket.on('connect', function(socket) {
        log('Socket '+sockets.indexOf(socket)+' connected.');
    });
    socket.setEncoding('utf-8');
    socket.on('data', function(data) {
        data = data.replace(/[\n\r]/g, '');
        if (data === '') {
            // Do nothing
        }
        else {
            streams[sockets.indexOf(socket)].write(data);
            
        }
    });
    socket.on('error', function() {
        socket.write('Error\n');
        socket.end();
    });
    readlines[sockets.indexOf(socket)] = rl.createInterface({
        input: streams[sockets.indexOf(socket)],
        output: socket
    });
    readlines[sockets.indexOf(socket)].on('SIGINT', function() {
        socket.end();
    });
    readlines[sockets.indexOf(socket)].setPrompt('', 0);
    readlines[sockets.indexOf(socket)].write('Welcome to CreativeMUD, version '+version+'.\nThere are currently '+ len + ' players logged in.\nTo exit CreativeMUD, type \'.exit\'.\nIf CreativeMUD seems to freeze, type \'.break\'.\nType \'help\' for help.\n');
    readlines[sockets.indexOf(socket)].question('What is your name?\n', function(answer) {
        answer.replace(/[\n\r]/g, '');
        log('Checking '+answer+' for name existence');
        nameLogins[sockets.indexOf(socket)] = answer;
        if (answer === '') {
            log('Disconnecting '+ sockets.indexOf[socket]);
            readlines[sockets.indexOf(socket)].write('Invalid Name.\n');
            readlines[sockets.indexOf(socket)].end();
            socket.end();
        }
        else {
            if (!doesNameExist(answer)) {
                log(answer+' does not exist, starting register on socket '+ sockets.indexOf(socket));
                socket.pause();
                socket.resume();
                process.nextTick(function () {
                readlines[sockets.indexOf(socket)].question('It looks like that is a new name, would you like to register? (y/n)\n', function(answer2) {
                    socket.pause();
                    answer2.replace(/[\n\r]/g, '');
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
                });
            }
            else {
                if (doesNameExist(answer)) {
                    if (doesNameExist(answer) != 'Error') {
                        readlines[sockets.indexOf(socket)].question('Welcome back, '+nameLogins[sockets.indexOf(socket)]+'. What is your password?\n', function(answer4) {
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
        }
    });
    // DEPRECATED:
    // players[sockets.indexOf(socket)] = 'none';
    len = len + 1;
    var startREPL = function() {
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
    };
}).listen(5001);




