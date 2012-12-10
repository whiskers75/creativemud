process.on('message', function(msg, type) {
    if (type == 'player') {
        var player = msg;
    }
});