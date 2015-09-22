var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('/index.html');
});

var port = process.env.PORT || 4344;
console.log("Listening on port "+port);
server.listen(port);