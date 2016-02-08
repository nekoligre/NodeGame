var express = require('express');
var app = express();

var WIDTH = 1100;
var HEIGHT = 580;

app.use(express.static(__dirname + '/www'));

var server = app.listen(8000,function(){
  console.log('server lift in port ---> 8000');
})

var io = require('socket.io')(server);

//io.set('log level', 1);

io.sockets.on('connection', function (socket) {
  socket.on('mousemove', function (data) {
    socket.broadcast.emit('moving', data);
  });
});