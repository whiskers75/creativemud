// CreativeMUD by whiskers75
// Licenced under the GPLv2.


    
    var net = require('net');
    var worker = require('./worker');
    var sockets = [];
    var listenerport;
    
    listenerport = 8080; // Port to listen on
    
    var s = net.Server(function(socket){
        sockets.push(socket);
        
        socket.on('data', function(data){
            worker.handle(data, socket);
        });
        
        socket.on('connection', function(socket){
            worker.handle('connection', socket);
        });
        
        exports.send = function send(message, socket) {
            sockets[socket].write(message, '\n');
        };
        
        socket.on('end', function() {
            var i = sockets.indexOf(socket);
            sockets.splice(i, 1);
        });
    });
    
    s.listen(listenerport);
    console.log("Listening on port: " + listenerport);


