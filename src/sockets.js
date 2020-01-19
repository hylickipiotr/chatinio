const socketIO = require('socket.io');

function init(server) {
  const io = socketIO(server);
  io.on('connection', () => {
    console.log('a user connected');
  });
}

module.exports = init;
