// CreativeMUD worker

function start() {
    
    var server = require(server.js);
    var sent;
    var items;
    var waitingType;
    var waitingFor;
    var tba;
    var waiting;
    var length;
    var users;
    var user;
    var fs = require("fs");
    fs.readFile('items', 'ascii', function(err, data) {
        if(err){
            console.log('Fatal Error #01 - File error:', err);
            process.exit(1);
        }
        items = data;
        console.log('Items loaded!');        
    });
    
    function handle(command, socket) {
        if (command === 'look') {
                sent = items;
        }
        if (command === 'login') {
                if (tba[socket]) {
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
            if (waiting) {
                server.send('Please wait..... Processing request. This may take a while...', socket);
                console.log('Waiting flag requested, but not available!');
            while (waiting) {
                if (!waiting) {
                    console.log('Setting waiting flag...');
                    waiting = true;
                    waitingFor = socket;
                    waitingType = 'register';
            }
            server.send('Please enter desired PIN.', socket);
            if (!waiting) {
                console.log('Setting waiting flag...');
                waiting = true;
                waitingFor = socket;
                waitingType = 'register';
            }
            }
            }
        else {
            if (command !== '') {
                if (waiting) {
                        if (socket === waitingFor) {
                            if (waitingType === 'login') {
                                user = command;
                                waiting = false;
                                console.log('Unsetting waiting flag...');
                                waitingFor = -1;
                                waitingType = 'null';
                            }
                            if (waitingType === 'register') {
                                length = length + 1;
                                users[length] = command;
                        }
                }
            }
        }
        server.send(sent, socket);
    }
        }
    function login(socket) {
        server.send('Please authenticate with the login command or register with the register command.', socket);
        tba[socket] = true;
        }
}
}