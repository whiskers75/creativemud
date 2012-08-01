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
var users = [];
var nnames = [];
var result;
var regs = 0;
var items = [];
var owners = [];
var areas = [];


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
            fs.readFile('items', 'ascii', function(err, data) {
                if(err){
                    console.log('Fatal Error #01 - File error:', err);
                    process.exit(1);
                }
                items = data;        
            });
            fs.readFile('areas', 'ascii', function(err, data) {
                if(err){
                    console.log('Fatal Error #01 - File error:', err);
                    process.exit(1);
                }
                areas = data;      
            });
            fs.readFile('owners', 'ascii', function(err, data) {
                if(err){
                    console.log('Fatal Error #01 - File error:', err);
                    process.exit(1);
                }
                owners = data;     
            });
            fs.readFile('users', 'ascii', function(err, data) {
                if(err){
                    console.log('Fatal Error #01 - File error:', err);
                    process.exit(1);
                }
                users = data;        
            });
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
                    fs.writeFile("items", items, function(err) {
                        if(err) {
                            console.log("Fatal Error #02 - File Error:", err);
                        } 
                        else {
                            console.log("Save complete.");
                            
                        }
                    });
                    fs.writeFile("areas", areas, function(err) {
                        if(err) {
                            console.log("Fatal Error #02 - File Error:", err);
                        } 
                        else {
                            console.log("Save complete.");
                        }
                    });
                    fs.writeFile("owners", owners, function(err) {
                        if(err) {
                            console.log("Fatal Error #02 - File Error:", err);
                        } 
                        else {
                            console.log("Save complete.");
                        }
                    });
                    fs.writeFile("users", users, function(err) {
                        if(err) {
                            console.log("Fatal Error #02 - File Error:", err);
                        } 
                        else {
                            console.log("Save complete.");
                        }
                    });
                    callback(null, 'Save complete.');
            }
            // put new commands here...
            else if(wait === 0) {
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
            wait = 0;
    }}).on('exit', function() {
        socket.end();
        len = len - 1;
    });
}).listen(5001);




