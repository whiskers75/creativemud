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
        
        socket.on('data', function(data){
// add new data to your buffer
        buf += data;

    // see if there is one or more complete messages
        if (buf.instr(msgTerminator) >= 0) {
        // slice up the buffer into messages
            var msgs = data.split(msgTerminator);

            for (var i = 0; i < msgs.length - 2; ++i) {
            // walk through each message in order
            var msg = msgs[i];

            // pick off the current message
            console.log('Data in server, sending to handle()');
            // send only the current message to your handler
            worker.handle(msg, socket);
        }

        buf = msgs[msgs.length - 1];  // put back any partial message into your buffer

        }
        
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
    });
    
    s.listen(listenerport);
    console.log("Listening on port: " + listenerport);


