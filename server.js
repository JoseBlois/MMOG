/*global console, require */
(function () {
    'use strict';
    var serverPort = 5000,
        server = null,
        io = null,
        nSight = 0;

    function MyServer(request, response) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('<h1>It\'s working!</h1>');
    }
    
    server = require('http').createServer(MyServer);
    server.listen(serverPort, function () {
        console.log('Server is listening on port ' + serverPort);
    });

    io = require('socket.io').listen(server);
    io.sockets.on('connection', function (socket) {
        socket.playerId = nSight;
        nSight += 1;
        io.sockets.emit('sight', {id: socket.playerId, x: 0, y: 0});
        console.log(socket.id + ' connected as player ' + socket.playerId);

        socket.on('mySight', function (sight) {
            io.sockets.emit('sight', {id: socket.playerId, x: sight.x, y: sight.y});
        });

        socket.on('disconnect', function () {
            io.sockets.emit('sight', {id: socket.playerId, x: null, y: null});
            console.log('Player' + socket.playerId + ' disconnected.');
        });
    });
}());