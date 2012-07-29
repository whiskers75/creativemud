// CreativeMUD by whiskers75
// Licenced under the GPLv2.


    
    var net = require('net');
    var worker = require('./worker');
    var sockets = [];
    var listenerport;
    var msgTerminator = '\n';
    var buf;

    
    listenerport = 8080; // Port to listen on
    
    var s = net.Server(function(socket){
        sockets.push(socket);
        
        socket.setEncoding('utf8');
        
        socket.on('data', function(data){
        //buf += data;
        //if (buf.instr(msgTerminator) >= 0) {
            //var msgs = data.split(msgTerminator);
            //for (var i = 0; i < msgs.length - 2; ++i) {
            //var msg = msgs[i];
        console.log('Data in server, sending to handle()');
        worker.handle(data, socket);
        //}

        //buf = msgs[msgs.length - 1];

        });
        
        socket.on('connection', function(socket){
            worker.handle('connection', socket);
        });
        
        exports.send = function send(message, socket) {
            console.log('Data sent to output');
            sockets[socket].write(message);
        };
        
        socket.on('end', function() {
            var i = sockets.indexOf(socket);
            sockets.splice(i, 1);
        });
    });
    
    
    s.listen(listenerport);
    console.log("Listening on port: " + listenerport);


