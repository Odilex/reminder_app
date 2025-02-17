import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

console.log('Starting connection test...');
console.log('Current directory:', __dirname);
console.log('Environment loaded:', process.env.NODE_ENV);
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set');

try {
  console.log('Attempting to connect to MongoDB...');
  
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    family: 4
  });
  
  console.log('Successfully connected to MongoDB.');
  process.exit(0);
} catch (error) {
  console.error('MongoDB connection error details:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Full error:', error);
  process.exit(1);
} 