import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import Reminder from '../models/Reminder.js';
import User from '../models/User.js';
import { cacheService } from '../services/cache.js';
import { db } from '../config/firebase.js';

const router = express.Router();

// Get user's dashboard data
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Check cache first
    const cacheKey = `dashboard:${req.user.uid}`;
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get user data
    const user = await User.findByUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get reminders for the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const remindersRef = db.collection('reminders');
    const upcomingSnapshot = await remindersRef
      .where('userId', '==', req.user.uid)
      .where('date', '>=', now)
      .where('date', '<=', tomorrow)
      .where('isCompleted', '==', false)
      .orderBy('date', 'asc')
      .limit(5)
      .get();

    const upcomingReminders = upcomingSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get reminders by category
    const categoriesSnapshot = await remindersRef
      .where('userId', '==', req.user.uid)
      .where('isCompleted', '==', false)
      .get();

    const remindersByCategory = categoriesSnapshot.docs.reduce((acc, doc) => {
      const reminder = doc.data();
      acc[reminder.category] = (acc[reminder.category] || 0) + 1;
      return acc;
    }, {});

    // Calculate completion rate
    const stats = user.stats || {
      totalReminders: 0,
      completedReminders: 0,
      streakDays: 0,
    };

    const completionRate = stats.totalReminders > 0
      ? (stats.completedReminders / stats.totalReminders * 100).toFixed(1)
      : 0;

    const dashboardData = {
      user: {
        displayName: user.displayName,
        email: user.email,
        stats,
      },
      upcomingReminders,
      remindersByCategory,
      stats: {
        ...stats,
        completionRate: parseFloat(completionRate),
      },
    };

    // Cache dashboard data
    await cacheService.set(cacheKey, dashboardData, 300); // Cache for 5 minutes

    res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share a reminder with other users
router.post('/share/:id', authMiddleware, async (req, res) => {
  try {
    const { emails } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Valid email list is required' });
    }

    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get user IDs for the provided emails
    const usersSnapshot = await db.collection('users')
      .where('email', 'in', emails)
      .get();

    const userIds = usersSnapshot.docs.map(doc => doc.id);
    if (userIds.length === 0) {
      return res.status(404).json({ message: 'No valid users found' });
    }

    // Update reminder with shared users
    const updatedReminder = await Reminder.shareWith(req.params.id, userIds);

    res.json({
      message: 'Reminder shared successfully',
      sharedWith: userIds.length,
      reminder: updatedReminder,
    });
  } catch (error) {
    console.error('Share reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reminders shared with the user
router.get('/shared-with-me', authMiddleware, async (req, res) => {
  try {
    const reminders = await Reminder.findSharedWithUser(req.user.uid);
    res.json(reminders);
  } catch (error) {
    console.error('Get shared reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's statistics
router.get('/stats', authMiddleware, apiLimiter, async (req, res) => {
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
router.put('/preferences', authMiddleware, apiLimiter, async (req, res) => {
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