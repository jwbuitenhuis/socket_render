// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));


var level = 50,
    speed = 1;

io.on('connection', function (socket) {
    var active = false;

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    setInterval(function () {
        var delta;

        if (active) {
            delta = getRandomArbitrary(-speed, speed);

            if (level + delta < 0 || level + delta > 100) {
                delta = -delta;
            }
            level = level + delta;
            socket.emit('data', {
                x: (new Date()).getTime(),
                y: level
            });
        }

    }, 1);


    socket.on('start', function () {
        active = true;
    });

    socket.on('stop', function () {
        active = false;
    });

});
