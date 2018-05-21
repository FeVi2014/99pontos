const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const colors = ["red", "green", "blue", "yellow"]
const distanceToKill = { x: 0, y: 0 }


app.set('port', process.env.PORT || 5000);
app.use('/static', express.static(__dirname + '/static'));
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(process.env.PORT || 5000, () => {
  console.log('Starting server on port 5000');
});

io.on('connection', (socket) => {});
setInterval(() => {
  io.sockets.emit('message', 'online');
}, 1000);

const players = {};
io.on('connection', (socket) => {
  socket.on('new player', () => {
    players[socket.id] = {
      x: 300,
      y: 300,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });
  socket.on('movement', (data) => {
    const player = players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
    if (data.attack) {
      Object.keys(players).map(enemy => {
        if(enemy !== socket.id && ((player.x - players[enemy].x) * -1) === distanceToKill.x && ((player.y - players[enemy].y) * -1) === distanceToKill.y ) {
          delete players[enemy];
        }
      })
    }
  });
});
setInterval(() => {
  io.sockets.emit('state', players);
}, 1000 / 60);
