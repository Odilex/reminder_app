import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { cacheService } from '../services/cache.js';

// Create Redis store for rate limiting
const limiterStore = new RedisStore({
  // @ts-ignore - Type definitions are not up to date
  sendCommand: (...args) => cacheService.client.sendCommand(args),
});

// General API rate limiter
export const apiLimiter = rateLimit({
  store: limiterStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiter
export const authLimiter = rateLimit({
  store: limiterStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints rate limiter
export const aiLimiter = rateLimit({
  store: limiterStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 AI requests per windowMs
  message: 'AI request limit exceeded, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
}); 