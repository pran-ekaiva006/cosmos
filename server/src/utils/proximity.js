/**
 * Calculate Euclidean distance between two points
 * @param {{x: number, y: number}} p1 
 * @param {{x: number, y: number}} p2 
 * @returns {number} distance
 */
const calculateDistance = (p1, p2) => {
  // If either player hasn't broadcasted a position, they are infinitely far away
  if (!p1 || !p2 || p1.x === null || p1.y === null || p2.x === null || p2.y === null) {
    return Infinity;
  }
  
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Generate a map of connections for users within a certain radius
 * @param {Object} users - dictionary of users { socketId: { x, y } }
 * @param {number} radius - the maximum proximity distance
 * @returns {Object} - mapping of { socketId: [connectedUserIds] }
 */
const getConnections = (users, radius) => {
  const connections = {};
  const userIds = Object.keys(users);

  // Initialize empty arrays
  userIds.forEach(id => {
    connections[id] = [];
  });

  // Calculate pairs (O(n^2 / 2) optimization)
  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      const id1 = userIds[i];
      const id2 = userIds[j];

      // Pure stateless calculation
      const dist = calculateDistance(users[id1], users[id2]);

      // If within proximity sphere, mark bi-directional connection
      if (dist < radius) {
        connections[id1].push(id2);
        connections[id2].push(id1);
      }
    }
  }

  return connections;
};

module.exports = {
  calculateDistance,
  getConnections
};
