const { addUser, updateUserPosition, removeUser, getUsers } = require('../store/userStore');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Register the client in abstract memory
    addUser(socket.id);

    // Track the throttled movement dispatches
    socket.on('move', (position) => {
      updateUserPosition(socket.id, position);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Wipe the footprint on drop
      removeUser(socket.id);
    });
  });
};

module.exports = socketHandler;
