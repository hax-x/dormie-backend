// ./database/mongo.js
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // Load environment variables

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/mydormie";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db = null;

async function connectToDatabase() {
  if (db) return db;

  try {
    await client.connect();
    console.log("MongoDB connected successfully");
    db = client.db("mydormie");
    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

module.exports = { connectToDatabase };
