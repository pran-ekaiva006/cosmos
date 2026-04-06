const users = {};

const addUser = (id) => {
  // Initialize with a default zeroed coordinate or null until they emit a setup position
  users[id] = { x: null, y: null };
};

const updateUserPosition = (id, position) => {
  if (users[id]) {
    users[id] = position;
  }
};

const removeUser = (id) => {
  delete users[id];
};

const getUsers = () => {
  return users;
};

module.exports = {
  addUser,
  updateUserPosition,
  removeUser,
  getUsers
};
