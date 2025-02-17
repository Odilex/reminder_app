import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectMongoose = async () => {
  try {
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

    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI format:', process.env.MONGODB_URI ? 'URI is set' : 'URI is missing');
    
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    
    // Additional error information for debugging
    if (error.reason) {
      console.error('Error reason:', error.reason);
      if (error.reason.servers) {
        console.error('Server states:');
        for (const [host, state] of Object.entries(error.reason.servers)) {
          console.error(`- ${host}:`, state.error || 'No specific error');
        }
      }
    }
    
    throw error;
  }
};

mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

export default connectMongoose; 