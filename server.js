// CreativeMUD by whiskers75
// Licenced under the GPLv2.

function start() {
    
    var net = require('net');
    var worker = require('./worker');
    var sockets = [];
    var listenerport;
    
    listenerport = 8080; // Port to listen on
    
    var s = net.Server(function(socket){
        sockets.push(socket);
        
        socket.on('data', function(data, socket){
            worker.handle(data, socket);
        });
        
        socket.on('connect', function(socket){
            worker.handle('connection', socket);
        });
        module.exports = {
            send: function(message, socket) {
                sockets[socket].write(message);
            }
        };
        
        socket.on('end', function() {
            var i = sockets.indexOf(socket);
            sockets.splice(i, 1);
        });
    });
    
    s.listen(listenerport);
    console.log("Listening on port: " + listenerport);
}

start();