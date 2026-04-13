import { MongoClient, ServerApiVersion } from 'mongodb';

// MongoDB connection URI - must be set via environment variable
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set. See .env.example for details.");
}

// Create a MongoClient with connection pooling
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 2,
});

// Database name
const DB_NAME = "WebDemo";

let isConnected = false;

// Function to connect to MongoDB (call once on server start)
export async function connectToDatabase() {
  if (!isConnected) {
    try {
      await client.connect();
      await client.db("admin").command({ ping: 1 });
      isConnected = true;
      console.log("✓ Successfully connected to MongoDB!");
    } catch (err) {
      console.error("✗ Failed to connect to MongoDB:", err.message);
      throw err;
    }
  }
  return client.db(DB_NAME);
}

// Function to get database (assumes already connected)
export function getDatabase() {
  if (!isConnected) {
    throw new Error("Database not connected. Call connectToDatabase() first.");
  }
  return client.db(DB_NAME);
}

// Function to close connection (call on server shutdown)
export async function closeConnection() {
  if (isConnected) {
    await client.close();
    isConnected = false;
    console.log("✓ MongoDB connection closed");
  }
}

// Export the client for direct use if needed
export { client, DB_NAME };
