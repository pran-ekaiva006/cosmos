const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected (Atlas Node): ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Safe failure - we don't crash the server just because db isn't running
    // so players can still move around
  }
};

module.exports = connectDB;
