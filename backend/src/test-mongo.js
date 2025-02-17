import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

console.log('Starting MongoDB connection test...');
console.log('Environment loaded:', process.env.NODE_ENV);
console.log('MongoDB URI format:', process.env.MONGODB_URI ? 'URI is set' : 'URI is missing');

const options = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority',
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  directConnection: false
};

try {
  console.log('Attempting to connect to MongoDB...');
  
  mongoose.connection.on('connecting', () => {
    console.log('Connecting to MongoDB...');
  });

  mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  
  await mongoose.connect(process.env.MONGODB_URI, options);
  
  // Try to perform a simple operation
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Available collections:', collections.map(c => c.name));
  
  console.log('MongoDB connection and operation test successful');
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error('MongoDB connection error details:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  if (error.code) console.error('Error code:', error.code);
  
  if (error.reason) {
    console.error('Error reason:', error.reason);
    if (error.reason.servers) {
      console.error('Server states:');
      for (const [host, state] of Object.entries(error.reason.servers)) {
        console.error(`- ${host}:`, state.error || 'No specific error');
      }
    }
  }
  
  process.exit(1);
} 