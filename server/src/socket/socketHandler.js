const { addUser, updateUserPosition, removeUser, getUsers } = require('../store/userStore');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    addUser(socket.id);
    io.emit('users', getUsers());

    socket.on('move', (position) => {
      updateUserPosition(socket.id, position);
      io.emit('users', getUsers());
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      removeUser(socket.id);
      io.emit('users', getUsers());
    });
  });
};

module.exports = socketHandler;
