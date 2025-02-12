import { MongoMemoryServer } from '@mongodb-memory-server/core';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import { jest } from '@jest/globals';

dotenv.config();

let mongoServer;
let redisClient;

// Setup before all tests
beforeAll(async () => {
  // Setup MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Setup Redis Client
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  await redisClient.connect();

  // Setup mocks
  await setupMocks();
});

// Cleanup after each test
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
  await redisClient.flushAll();
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await redisClient.quit();
});

// Global test setup
global.setupTestDB = async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
};

// Setup mocks
async function setupMocks() {
  // Mock Firebase Admin
  await jest.unstable_mockModule('firebase-admin', () => ({
    default: {
      credential: {
        cert: jest.fn()
      },
      initializeApp: jest.fn(),
      auth: jest.fn(() => ({
        verifyIdToken: jest.fn(),
        createCustomToken: jest.fn()
      })),
      firestore: jest.fn(() => ({
        collection: jest.fn()
      }))
    }
  }));

  // Mock OpenAI
  await jest.unstable_mockModule('openai', () => ({
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  }));
} 