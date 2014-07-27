/*global console*/

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


var prettyjson = require('prettyjson'),
    StompClient = require('stomp-client').StompClient,
    connectedSocket;

var destination = '/topic/TRAIN_MVT_EG_TOC',
    client = new StompClient('datafeeds.networkrail.co.uk', 61618, 'jwbuitenhuis@gmail.com', 'dXdx345!');

client.connect(function () {
    console.log('Trying to connect...');
    client.subscribe(destination, function (body, headers) {
        var trainEvent = JSON.parse(body);

        trainEvent.map(function (event) {
            var body = event.body;
            if (body.event_type === 'ARRIVAL' && body.loc_stanox && body.train_id) {
                console.log(body.loc_stanox + ',' + body.train_id + ',' + body.actual_timestamp);

                if (connectedSocket) {
                    connectedSocket.emit('train', event);
                    //console.log('loc_stanox: ', prettyjson.render(trainEvent[0].body.loc_stanox));
                }
            }
        });


    });
});

io.on('connection', function (socket) {
//    connectedSocket = socket;
});
