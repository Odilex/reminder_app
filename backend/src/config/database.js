import mongoose from 'mongoose';
import { MongoClient, ServerApiVersion } from 'mongodb';

// Mongoose connection for ODM
export const connectMongoose = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log('MongoDB connected successfully via Mongoose');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Native MongoDB client for advanced operations
export const getMongoClient = async () => {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB client connected successfully");
    return client;
  } catch (error) {
    console.error('MongoDB client connection error:', error);
    throw error;
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
}); 