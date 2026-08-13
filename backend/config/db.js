const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staysmart_db';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Allow up to 5s for Atlas to connect
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
