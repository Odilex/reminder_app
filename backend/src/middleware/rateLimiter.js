import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client for rate limiting
const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

// Handle Redis connection
redisClient.on('error', (err) => {
  console.error('Rate limiter Redis Client Error:', err);
  console.log('Falling back to memory store for rate limiting');
});

redisClient.on('connect', () => {
  console.log('Rate limiter connected to Redis Cloud');
});

redisClient.connect().catch(console.error);

// Create store factory function
const createRedisStore = (prefix) => {
  try {
    return new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: prefix // Use unique prefix for each limiter
    });
  } catch (error) {
    console.error('Error creating Redis store:', error);
    return undefined; // Will fall back to memory store
  }
};

// General API rate limiter
export const apiLimiter = rateLimit({
  store: createRedisStore('api_limit:'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiter
export const authLimiter = rateLimit({
  store: createRedisStore('auth_limit:'),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints rate limiter
export const aiLimiter = rateLimit({
  store: createRedisStore('ai_limit:'),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 AI requests per windowMs
  message: 'AI request limit exceeded, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
}); 