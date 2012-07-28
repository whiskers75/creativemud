// CreativeMUD worker


    
    var server = require('./server');
    var sent;
    var items = [];
    var waitingType;
    var waitingFor;
    var tba = [];
    var waiting;
    var len;
    var users = [];
    var user = [];
    var unums = [];
    var fs = require("fs");
    fs.readFile('items', 'ascii', function(err, data) {
        if(err){
            console.log('Fatal Error #01 - File error:', err);
            process.exit(1);
        }
        items = data;
        console.log('Items loaded!');        
    });
    fs.readFile('users', 'ascii', function(err, data) {
        if(err){
            console.log('Fatal Error #01 - File error:', err);
            process.exit(1);
        }
        users = data;
        console.log('Users loaded!');        
    });   
    fs.readFile('unums', 'ascii', function(err, data) {
        if(err){
            console.log('Fatal Error #01 - File error:', err);
            process.exit(1);
        }
        items = data;
        console.log('User numbers loaded!');        
    });
    
        exports.handle = function handle(command, socket) {
            console.log('Data sent to handle()');
            command = command.toString();
            console.log(command);
            if (command === 'look') {
                     server.send(items, socket);
                    console.log('Look command interpreted.');
            }
            if (command === 'login') {
                console.log('Login command interpreted.');
                    if (tba[socket]) {
                        console.log('TBA interpreted as true');
                        while (waiting) {
                            if (!waiting) {
                                server.send('Please enter PIN.', socket);
                                console.log('Setting waiting flag...');
                                waiting = true;
                                waitingFor = socket;
                                waitingType = 'login';
                            }
                        }
                        if (!waiting) {
                            server.send('Please enter PIN.', socket);
                            console.log('Setting waiting flag...');
                            waiting = true;
                            waitingFor = socket;
                            waitingType = 'login';
                        }
                    }
            }
            if (command === 'register') {
                console.log('Register command interpreted');
                if (waiting) {
                    server.send('Please wait..... Processing request. This may take a while...', socket);
                    console.log('Waiting flag requested, but not available!');
                while (waiting) {
                    if (!waiting) {
                        console.log('Setting waiting flag...');
                        server.send('Please enter desired PIN.', socket);
                        waiting = true;
                        waitingFor = socket;
                        waitingType = 'register';
                }
                if (!waiting) {
                    console.log('Setting waiting flag...');
                    server.send('Please enter desired PIN.', socket);
                    waiting = true;
                    waitingFor = socket;
                    waitingType = 'register';
                }
                }
                }
                if (command === 'save') {
                    console.log('Save command interpreted');
                    fs.writeFile("items", items, function(err) {
                        if(err) {
                            console.log("Fatal Error #02 - File Error:", err);
                        } 
                        else {
                            console.log("Save complete.");
                            server.send('Save complete.', socket);
                        }
                    });
                    fs.writeFile("users", users, function(err) {
                        if(err) {
                            console.log("Fatal Error #02 - File Error:", err);
                        } 
                        else {
                            console.log("Save complete.");
                            server.send('Save complete.', socket);
                        }
                    });
                    fs.writeFile("unums", unums, function(err) {
                        if(err) {
                            console.log("Fatal Error #02 - File Error:", err);
                        } 
                        else {
                            console.log("Save complete.");
                            server.send('Save complete.', socket);
                        }
                    });
                }
                    if (command === 'connection') {
                        server.send('Please [login] or [register].', socket);
            }
                    tba[socket] = true;
                }
            else {
                if (command === '') {
                    console.log('No command entered.');
                    server.send('Please enter a command...', socket);
                }
                if (command !== '') {
                    if (waiting) {
                            if (socket === waitingFor) {
                                if (waitingType === 'login') {
                                    user = command;
                                    waiting = false;
                                    console.log('Unsetting waiting flag...');
                                    waitingFor = 1000;
                                    waitingType = 'null';
                                }
                                if (waitingType === 'register') {
                                    len = len + 1;
                                    users[len] = command;
                                    unums[len] = socket;
                            }
                    }
                }
            }
        }
            };