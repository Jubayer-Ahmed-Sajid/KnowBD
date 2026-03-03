const mongoose = require('mongoose');
const connectDB = require('../server/config/db');
const app = require('../server/index');

/**
 * Vercel Serverless Handler
 *
 * Caches the MongoDB connection across warm invocations so we don't
 * open a new socket on every request.  `mongoose.connection.readyState`
 * values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting.
 */
let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected && mongoose.connection.readyState !== 1) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};

module.exports = handler;
