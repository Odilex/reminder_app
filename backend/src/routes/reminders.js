import express from 'express';
import { body, query } from 'express-validator';
import auth from '../middleware/auth.js';
import { validate, commonValidations } from '../middleware/validator.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import Reminder from '../models/Reminder.js';
import { cacheService } from '../services/cache.js';
import { schedulerService } from '../services/scheduler.js';
import { syncService } from '../services/sync.js';

const router = express.Router();

// Get all reminders for a user
router.get('/', auth, apiLimiter, async (req, res) => {
  try {
    const { category, priority, isCompleted, search, startDate, endDate } = req.query;
    
    // Check cache first
    const cacheKey = `user:${req.user.userId}:reminders:${JSON.stringify(req.query)}`;
    const cachedReminders = await cacheService.get(cacheKey);
    if (cachedReminders) {
      return res.json(cachedReminders);
    }

    // Build query
    const query = { user: req.user.userId };
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (isCompleted !== undefined) query.isCompleted = isCompleted === 'true';
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const reminders = await Reminder.find(query).sort({ date: 1 });
    
    // Cache results
    await cacheService.set(cacheKey, reminders, 300); // Cache for 5 minutes
    
    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Error fetching reminders' });
  }
});

// Create a new reminder
router.post('/', auth, apiLimiter, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/).withMessage('Valid time is required (HH:MM AM/PM)'),
  body('category').isIn(['work', 'personal', 'shopping', 'health', 'other']).withMessage('Valid category is required'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Valid priority is required'),
  validate
], async (req, res) => {
  try {
    const reminderData = {
      ...req.body,
      user: req.user.userId
    };

    const reminder = await Reminder.create(reminderData);
    
    // Schedule reminder notification
    schedulerService.scheduleReminder(reminder);
    
    // Sync to Firebase
    await syncService.syncReminderToFirebase(reminder);
    
    // Clear cache
    await cacheService.clearUserCache(req.user.userId);
    
    // Update user stats
    await reminder.model('User').findByIdAndUpdate(req.user.userId, {
      $inc: { 'stats.totalReminders': 1 }
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ message: 'Error creating reminder' });
  }
});

// Update a reminder
router.put('/:id', auth, apiLimiter, [
  body('title').optional().trim().notEmpty(),
  body('date').optional().isISO8601().toDate(),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/),
  body('category').optional().isIn(['work', 'personal', 'shopping', 'health', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  validate
], async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    Object.assign(reminder, req.body);
    await reminder.save();
    
    // Reschedule notification if date/time changed
    if (req.body.date || req.body.time) {
      schedulerService.cancelReminder(reminder._id);
      schedulerService.scheduleReminder(reminder);
    }
    
    // Sync to Firebase
    await syncService.syncReminderToFirebase(reminder);
    
    // Clear cache
    await cacheService.clearUserCache(req.user.userId);

    res.json(reminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ message: 'Error updating reminder' });
  }
});

// Delete a reminder
router.delete('/:id', auth, apiLimiter, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    await reminder.deleteOne();
    
    // Cancel scheduled notification
    schedulerService.cancelReminder(reminder._id);
    
    // Clear cache
    await cacheService.clearUserCache(req.user.userId);

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ message: 'Error deleting reminder' });
  }
});

// Mark reminder as complete
router.patch('/:id/complete', auth, apiLimiter, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    await reminder.markComplete();
    
    // Cancel scheduled notification
    schedulerService.cancelReminder(reminder._id);
    
    // Sync to Firebase
    await syncService.syncReminderToFirebase(reminder);
    
    // Clear cache
    await cacheService.clearUserCache(req.user.userId);

    res.json(reminder);
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({ message: 'Error completing reminder' });
  }
});

// Get upcoming reminders
router.get('/upcoming', auth, apiLimiter, [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  validate
], async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const reminders = await Reminder.findUpcoming(req.user.userId, limit);
    res.json(reminders);
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ message: 'Error fetching upcoming reminders' });
  }
});

export default router; 