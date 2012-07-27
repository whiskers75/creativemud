// CreativeMUD by whiskers75
// Licenced under the GPLv2.


var net = require('net');
var worker = require(worker.js);

listenerport = 8080 // Port to listen on

var s = net.Server(function(socket){
    sockets.push(socket)
    
    socket.on('data', function(data){
    for (var i = 0; i < sockets.length; i++){
	    sockets[i].write("Socket number: " + sockets.indexOf(socket) +" posts message: " + data);
    }
    });
    
    function send(message, socket) {
        sockets[socket].write(message);
    }
    
    socket.on('end', function() {
	var i = sockets.indexOf(socket);
	sockets.splice(i, 1);
    });
});

s.listen(listenerport)
console.log("Listening on port: " + listenerport)