const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staysmart_db', {
      serverSelectionTimeoutMS: 2500 // Fast fail if Mongo isn't running locally
    });
    isConnectedToMongo = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`[Database Notice]: MongoDB local connection skipped (${err.message}). Running gracefully with high-performance In-Memory Data Store!`);
  }
};

const getMongoStatus = () => isConnectedToMongo;

module.exports = { connectDB, getMongoStatus };
