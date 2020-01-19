const socketIO = require('socket.io');

const serverState = {
  users: {},
  activeConnections: 0,
};

function init(server) {
  const io = socketIO(server);
  io.on('connection', (socket) => {
    serverState.activeConnections++;
    console.log(`User connected. Number of active connections: ${serverState.activeConnections}`);

    function getUser() {
      return serverState.users[socket.id];
    }

    function emitUsers() {
      io.emit('chat-users', serverState.users);
    }

    function emitMessage(message) {
      io.emit('chat-message', message);
    }

    socket.on('set-user', (user) => {
      serverState.users[socket.id] = {
        name: user.name,
      };
      emitUsers();
      console.log(`User '${getUser().name}' joined to chat`);
    });


    socket.on('chat-message', (msg) => {
      const message = {
        user: getUser(),
        timestamp: Date.now(),
        content: msg,
      };

      emitMessage(message);
    });

    socket.on('disconnect', () => {
      const user = getUser();
      serverState.activeConnections--;
      if (!user) {
        console.log(`User disconnected. Number of active connections: ${serverState.activeConnections}`);
        return;
      }
      if (user.name) {
        delete serverState.users[socket.id];
      }
      console.log(`User '${user.name}' disconnected. Number of active connections: ${serverState.activeConnections}`);
      emitUsers();
    });
  });
}

module.exports = init;
