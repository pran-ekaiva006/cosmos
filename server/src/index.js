require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const socketHandler = require('./socket/socketHandler');
const connectDB = require('./config/db');

const PORT = 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Boot the database pool
connectDB();

socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
