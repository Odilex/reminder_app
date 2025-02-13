import { createClient } from 'redis';

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.isRedisAvailable = false;
    
    this.client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: true,
        rejectUnauthorized: false
      }
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isRedisAvailable = false;
    });
    
    this.client.on('connect', () => {
      console.log('Connected to Redis Cloud');
      this.isRedisAvailable = true;
    });

    this.client.on('reconnecting', () => {
      console.log('Reconnecting to Redis Cloud...');
    });
  }

  async connect() {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
        this.isRedisAvailable = true;
      }
    } catch (error) {
      console.error('Redis connection error:', error);
      this.isRedisAvailable = false;
      console.log('Falling back to in-memory cache');
    }
  }

  async disconnect() {
    if (this.isRedisAvailable && this.client.isOpen) {
      await this.client.quit();
    }
  }

  async get(key) {
    try {
      if (this.isRedisAvailable) {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        const data = this.memoryCache.get(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, expirationInSeconds = 3600) {
    try {
      const stringValue = JSON.stringify(value);
      if (this.isRedisAvailable) {
        await this.client.set(key, stringValue, {
          EX: expirationInSeconds
        });
      } else {
        this.memoryCache.set(key, stringValue);
        // Simple expiration for memory cache
        setTimeout(() => {
          this.memoryCache.delete(key);
        }, expirationInSeconds * 1000);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (this.isRedisAvailable) {
        await this.client.del(key);
      } else {
        this.memoryCache.delete(key);
      }
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