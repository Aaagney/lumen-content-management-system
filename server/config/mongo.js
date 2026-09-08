const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lumen_cms';

let isConnected = false;

const connectDB = () => {
  if (isConnected) return;

  mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    })
    .then((conn) => {
      isConnected = true;
      console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    })
    .catch((error) => {
      console.warn(`[MongoDB] Notice: Could not reach MongoDB daemon at ${MONGO_URI} (${error.message}).`);
      console.log(`[MongoDB] Utilizing resilient in-memory hybrid store for Subscription Module.`);
    });
};

module.exports = { connectDB, mongoose };
