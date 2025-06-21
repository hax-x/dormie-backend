// mongo.js
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // Ensure you have dotenv installed and configured
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/mydormie"; // Fallback to local MongoDB if no URI is provided

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Instead of immediately connecting and disconnecting, export the client
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    return client.db("mydormie"); // Return the database instance
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
    throw error;
  }
}

module.exports = { connectToDatabase };