const { addUser, updateUserPosition, removeUser, getUsers } = require('../store/userStore');
const { getConnections } = require('../utils/proximity');

const PROXIMITY_RADIUS = 150; // Interaction boundary distance
let previousConnections = {}; // Stores previous connection state separately

// Pure side-effect handler for tracking and broadcasting network state deltas
const handleConnectionStateChanges = (io) => {
  const users = getUsers();
  const currentConnections = getConnections(users, PROXIMITY_RADIUS);

  // Pool all active and dropped node IDs to calculate removals and additions securely
  const allTrackedIds = new Set([
    ...Object.keys(previousConnections), 
    ...Object.keys(currentConnections)
  ]);

  allTrackedIds.forEach((socketId) => {
    const prev = previousConnections[socketId] || [];
    const curr = currentConnections[socketId] || [];

    // Filter to isolate exclusive modifications (Avoids duplicate payload events)
    const newConnections = curr.filter(id => !prev.includes(id));
    const removedConnections = prev.filter(id => !curr.includes(id));

    // Target the specific user with newly connected entities
    if (newConnections.length > 0) {
      io.to(socketId).emit('user_connected', newConnections);
    }
    
    // Target the specific user with newly dropped entities
    if (removedConnections.length > 0) {
      io.to(socketId).emit('user_disconnected', removedConnections);
    }
  });

  // Snapshot the fresh state to prevent duplicate loops on the next payload
  previousConnections = currentConnections;
};

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    addUser(socket.id);
    io.emit('users', getUsers());
    handleConnectionStateChanges(io); // Calculate shifts on new join

    socket.on('move', (position) => {
      updateUserPosition(socket.id, position);
      io.emit('users', getUsers());
      handleConnectionStateChanges(io); // Re-calculate clusters on explicit movement natively
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      removeUser(socket.id);
      io.emit('users', getUsers());
      handleConnectionStateChanges(io); // Recalculate clusters on sudden drops
    });
  });
};

module.exports = socketHandler;
