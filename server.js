/*global console, require */
(function () {
    'use strict';
    var serverPort = 5000,
        server = null,
        io = null,
        nSight = 0;
    var gameEnd = 0,
        canvasWidth = 300,
        canvasHeight = 200,
        players = [],
        target = null;

    function Circle (x , y , radius){
        this.x = (x === undefined)? 0 : x;
        this.y = (y === undefined)? 0 : y;
        this.radius = (radius === undefined)? 0 : radius;
    }

    Circle.prototype ={
        constructor : Circle,

        distance : function(circle){
            if(circle !== undefined){
            var dx=this.x-circle.x;
            var dy=this.y-circle.y;
            return (Math.sqrt(dx*dx+dy*dy)-(this.radius+circle.radius));
            }
        }
    };

    function MyServer(request, response) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('<h1>It\'s working!</h1>');
    }
    
    target = new Circle(100, 100, 10);

    server = require('http').createServer(MyServer);
    server.listen(serverPort, function () {
        console.log('Server is listening on port ' + serverPort);
    });

    io = require('socket.io').listen(server);
    io.sockets.on('connection', function (socket) {
        socket.playerId = nSight;
        nSight += 1;
        players[socket.playerId] = new Circle(0, 0, 5);
        socket.emit('me', {id : socket.playerId});
        io.sockets.emit('sight', {id: socket.playerId, x: 0, y: 0});
        console.log(socket.id + ' connected as player ' + socket.playerId);

        socket.on('mySight', function (sight) {
            players[socket.playerId].x = sight.x;
            players[socket.playerId].y = sight.y;
            if(sight.lastPress ===1){
                act(socket.playerId)
            }
            io.sockets.emit('sight', {id: socket.playerId, x: sight.x, y: sight.y, lastPress : sight.lastPress});
        });

        socket.on('disconnect', function () {
            io.sockets.emit('sight', {id: socket.playerId, x: null, y: null});
            console.log('Player' + socket.playerId + ' disconnected.');
        });
    });

    function random(max){
        return ~~(Math.random()*max);
    }
    
    function act(player){
        var now  = Date.now();
        if(gameEnd - now < -1000){
            gameEnd = now + 10000;
            io.sockets.emit('gameEnd', {time : gameEnd});
            target.x = random((canvasWidth/10-1) * 10 +target.radius)
            target.y = random((canvasHeight/10-1) * 10 +target.radius)
            io.sockets.emit('target', {x: target.x, y: target.y});
        } else if (gameEnd - now > 0){
            if(players[player].distance(target)< 0){
                io.sockets.emit('score', {id: player , score : 1});
                target.x = random((canvasWidth/10-1) * 10 +target.radius)
                target.y = random((canvasHeight/10-1) * 10 +target.radius)
                io.sockets.emit('target', {x : target.x , y : target.y});
            }
        }
    }

}());