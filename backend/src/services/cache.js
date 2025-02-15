class CacheService {
  constructor() {
    this.memoryCache = new Map();
  }

  async connect() {
    // No-op for memory cache
    return Promise.resolve();
  }

  async disconnect() {
    // No-op for memory cache
    return Promise.resolve();
  }

  async get(key) {
    try {
      const data = this.memoryCache.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, expirationInSeconds = 3600) {
    try {
      const stringValue = JSON.stringify(value);
      this.memoryCache.set(key, stringValue);
      // Simple expiration for memory cache
      setTimeout(() => {
        this.memoryCache.delete(key);
      }, expirationInSeconds * 1000);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      this.memoryCache.delete(key);
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
      keys.forEach(key => this.del(key));
      return true;
    } catch (error) {
      console.error('Clear cache error:', error);
      return false;
    }
  }
}

export const cacheService = new CacheService();