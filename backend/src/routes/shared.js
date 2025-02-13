import express from 'express';
import auth from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import Reminder from '../models/Reminder.js';
import User from '../models/User.js';
import { cacheService } from '../services/cache.js';

const router = express.Router();

// Get user's dashboard data
router.get('/dashboard', auth, apiLimiter, async (req, res) => {
  try {
    // Check cache first
    const cacheKey = `user:${req.user.userId}:dashboard`;
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get user data with stats
    const user = await User.findById(req.user.userId);
    
    // Get upcoming reminders
    const upcomingReminders = await Reminder.findUpcoming(req.user.userId, 5);
    
    // Get reminders by category
    const remindersByCategory = await Reminder.aggregate([
      { $match: { user: user._id, isCompleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Get completion rate
    const totalReminders = user.stats.totalReminders;
    const completedReminders = user.stats.completedReminders;
    const completionRate = totalReminders > 0 
      ? (completedReminders / totalReminders * 100).toFixed(1)
      : 0;

    const dashboardData = {
      user: {
        displayName: user.displayName,
        email: user.email,
        stats: user.stats
      },
      upcomingReminders,
      remindersByCategory,
      stats: {
        totalReminders,
        completedReminders,
        completionRate,
        streakDays: user.stats.streakDays
      }
    };

    // Cache dashboard data
    await cacheService.set(cacheKey, dashboardData, 300); // Cache for 5 minutes

    res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get user's statistics
router.get('/stats', auth, apiLimiter, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateRange = {
      $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate ? new Date(endDate) : new Date()
    };

    // Get reminders statistics
    const stats = await Reminder.aggregate([
      { $match: { user: req.user.userId, date: dateRange } },
      { $group: {
        _id: null,
        totalReminders: { $sum: 1 },
        completedReminders: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
      }}
    ]);

    // Get category distribution
    const categoryStats = await Reminder.aggregate([
      { $match: { user: req.user.userId, date: dateRange } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get daily completion trend
    const dailyTrend = await Reminder.aggregate([
      { $match: { user: req.user.userId, date: dateRange, isCompleted: true } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalReminders: 0,
        completedReminders: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0
      },
      categoryDistribution: categoryStats,
      dailyCompletionTrend: dailyTrend
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Update user preferences
router.put('/preferences', auth, apiLimiter, async (req, res) => {
  try {
    const { theme, notifications, timezone } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (theme) user.preferences.theme = theme;
    if (notifications) Object.assign(user.preferences.notifications, notifications);
    if (timezone) user.preferences.timezone = timezone;

    await user.save();
    
    // Clear cache
    await cacheService.clearUserCache(req.user.userId);

    res.json({ preferences: user.preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Error updating preferences' });
  }
});

// Get system health status
router.get('/health', async (req, res) => {
  try {
    const status = {
      api: 'healthy',
      timestamp: new Date(),
      services: {
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        cache: cacheService.client.isReady ? 'connected' : 'disconnected'
      }
    };

    res.json(status);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ message: 'Error checking system health' });
  }
});

export default router; 