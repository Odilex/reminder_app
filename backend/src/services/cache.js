class CacheService {
  constructor() {
    this.memoryCache = new Map();
  }

  async initialize() {
    try {
      await this.connect();
      console.log('Cache service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize cache service:', error);
      return false;
    }
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
    return this.set(`reminders:${userId}`, reminders);
  }

  // Get cached user's reminders
  async getCachedUserReminders(userId) {
    return this.get(`reminders:${userId}`);
  }

  // Cache AI suggestions
  async cacheAISuggestions(userId, suggestions) {
    return this.set(`suggestions:${userId}`, suggestions);
  }

  // Get cached AI suggestions
  async getCachedAISuggestions(userId) {
    return this.get(`suggestions:${userId}`);
  }

  // Cache user insights
  async cacheUserInsights(userId, insights) {
    return this.set(`insights:${userId}`, insights);
  }

  // Get cached user insights
  async getCachedUserInsights(userId) {
    return this.get(`insights:${userId}`);
  }

  // Clear user's cache
  async clearUserCache(userId) {
    try {
      await Promise.all([
        this.del(`reminders:${userId}`),
        this.del(`suggestions:${userId}`),
        this.del(`insights:${userId}`),
      ]);
      return true;
    } catch (error) {
      console.error('Clear user cache error:', error);
      return false;
    }
  }
}

export const cacheService = new CacheService();