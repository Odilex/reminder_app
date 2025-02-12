import { createClient } from 'redis';
import { promisify } from 'util';

class CacheService {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => console.log('Connected to Redis'));

    // Promisify Redis commands
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  async connect() {
    await this.client.connect();
  }

  async get(key) {
    try {
      const data = await this.getAsync(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, expirationInSeconds = 3600) {
    try {
      await this.setAsync(key, JSON.stringify(value), 'EX', expirationInSeconds);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.delAsync(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Cache user's reminders
  async cacheUserReminders(userId, reminders) {
    const key = `user:${userId}:reminders`;
    return this.set(key, reminders);
  }

  // Get cached user's reminders
  async getCachedUserReminders(userId) {
    const key = `user:${userId}:reminders`;
    return this.get(key);
  }

  // Cache AI suggestions
  async cacheAISuggestions(userId, suggestions) {
    const key = `user:${userId}:ai_suggestions`;
    return this.set(key, suggestions, 7200); // Cache for 2 hours
  }

  // Get cached AI suggestions
  async getCachedAISuggestions(userId) {
    const key = `user:${userId}:ai_suggestions`;
    return this.get(key);
  }

  // Cache user insights
  async cacheUserInsights(userId, insights) {
    const key = `user:${userId}:insights`;
    return this.set(key, insights, 86400); // Cache for 24 hours
  }

  // Get cached user insights
  async getCachedUserInsights(userId) {
    const key = `user:${userId}:insights`;
    return this.get(key);
  }

  // Clear user's cache
  async clearUserCache(userId) {
    const keys = [
      `user:${userId}:reminders`,
      `user:${userId}:ai_suggestions`,
      `user:${userId}:insights`
    ];

    try {
      await Promise.all(keys.map(key => this.del(key)));
      return true;
    } catch (error) {
      console.error('Clear cache error:', error);
      return false;
    }
  }
}

export const cacheService = new CacheService(); 