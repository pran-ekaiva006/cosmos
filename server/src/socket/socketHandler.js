const { addUser, updateUserPosition, removeUser, getUsers } = require('../store/userStore');
const { getConnections } = require('../utils/proximity');
const Message = require('../models/Message');

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
      newConnections.forEach(peerId => {
        // Deterministic room assignment ID
        const roomId = [socketId, peerId].sort().join('-');
        const socketInstance = io.sockets.sockets.get(socketId);
        if (socketInstance) socketInstance.join(roomId);
      });
      io.to(socketId).emit('user_connected', newConnections);
    }
    
    // Target the specific user with newly dropped entities
    if (removedConnections.length > 0) {
      removedConnections.forEach(peerId => {
        const roomId = [socketId, peerId].sort().join('-');
        const socketInstance = io.sockets.sockets.get(socketId);
        if (socketInstance) socketInstance.leave(roomId);
      });
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

    // --- Persisted State (MongoDB) ---
    // Safely writes payloads to Mongoose Schema before dropping them across the native wire
    socket.on('send_message', async ({ receiverId, message }) => {
      try {
        const roomId = [socket.id, receiverId].sort().join('-');

        // Domain Restrict: Only actively connected (in proximity) users can send messages
        if (!socket.rooms.has(roomId)) {
          console.warn(`Blocked message delivery: User ${socket.id} is not geographically connected to ${receiverId}`);
          return;
        }

        const payload = new Message({
          senderId: socket.id,
          receiverId,
          message
        });
        await payload.save();

        // Relay exactly across the private deterministic room
        socket.to(roomId).emit('receive_message', {
          senderId: socket.id,
          message: payload.message,
          createdAt: payload.createdAt
        });
      } catch (err) {
        console.error('Memory persistence failed:', err);
      }
    });

    // Loads chronological historical chunks from the Database directly to the requester
    socket.on('fetch_messages', async (peerId) => {
      try {
        const history = await Message.find({
          $or: [
            { senderId: socket.id, receiverId: peerId },
            { senderId: peerId, receiverId: socket.id }
          ]
        }).sort({ createdAt: 1 });

        socket.emit('messages_history', history);
      } catch (err) {
        console.error('Failed to buffer chat payload:', err);
      }
    });
  });
};

module.exports = socketHandler;
