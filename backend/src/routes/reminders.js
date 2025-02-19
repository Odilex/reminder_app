import express from 'express';
import { body, query, validationResult } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import Reminder from '../models/Reminder.js';
import { cacheService } from '../services/cache.js';
import { schedulerService } from '../services/scheduler.js';
import { aiService } from '../services/ai.js';

const router = express.Router();

// Get all reminders for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, priority, isCompleted, startDate, endDate } = req.query;
    
    // Check cache first
    const cacheKey = `reminders:${req.user.uid}:${JSON.stringify(req.query)}`;
    const cachedReminders = await cacheService.get(cacheKey);
    if (cachedReminders) {
      return res.json(cachedReminders);
    }

    // Build filters
    const filters = {};
    if (category) filters.category = category;
    if (priority) filters.priority = priority;
    if (isCompleted !== undefined) filters.isCompleted = isCompleted === 'true';
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const reminders = await Reminder.findByUser(req.user.uid, filters);
    
    // Cache results
    await cacheService.set(cacheKey, reminders, 300); // Cache for 5 minutes
    
    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new reminder
router.post('/', [
  authMiddleware,
  body('title').trim().isLength({ min: 1 }),
  body('date').isISO8601(),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/),
  body('category').isIn(['work', 'personal', 'shopping', 'health', 'other']),
  body('priority').isIn(['low', 'medium', 'high']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reminderData = {
      ...req.body,
      userId: req.user.uid,
    };

    const reminder = await Reminder.create(reminderData);
    
    // Clear user's reminders cache
    await cacheService.del(`reminders:${req.user.uid}`);
    
    // Schedule reminder notification
    await schedulerService.sendPushNotification(reminder);
    
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific reminder
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a reminder
router.put('/:id', [
  authMiddleware,
  body('title').optional().trim().isLength({ min: 1 }),
  body('date').optional().isISO8601(),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/),
  body('category').optional().isIn(['work', 'personal', 'shopping', 'health', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedReminder = await Reminder.update(req.params.id, req.body);
    
    // Clear user's reminders cache
    await cacheService.del(`reminders:${req.user.uid}`);
    
    res.json(updatedReminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a reminder
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Reminder.delete(req.params.id);
    
    // Clear user's reminders cache
    await cacheService.del(`reminders:${req.user.uid}`);
    
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark reminder as complete/incomplete
router.patch('/:id/complete', [
  authMiddleware,
  body('isCompleted').isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedReminder = await Reminder.markComplete(req.params.id, req.body.isCompleted);
    
    // Clear user's reminders cache
    await cacheService.del(`reminders:${req.user.uid}`);
    
    res.json(updatedReminder);
  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get AI suggestions for optimal reminder time
router.post('/:id/suggest-time', authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const suggestion = await aiService.predictOptimalTime(reminder, req.user.uid);
    res.json(suggestion);
  } catch (error) {
    console.error('Suggest time error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 