import express from 'express';
import auth from '../middleware/auth.js';
import { aiService } from '../services/ai.js';
import { cacheService } from '../services/cache.js';
import Reminder from '../models/Reminder.js';

const router = express.Router();

// Get AI-generated reminder suggestions
router.get('/suggestions', auth, async (req, res) => {
  try {
    // Check cache first
    const cachedSuggestions = await cacheService.getCachedAISuggestions(req.user.userId);
    if (cachedSuggestions) {
      return res.json(cachedSuggestions);
    }

    // Get user's reminders for the last 30 days
    const reminders = await Reminder.find({
      user: req.user.userId,
      date: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    });

    const suggestions = await aiService.generateSuggestions(reminders);
    
    // Cache the suggestions
    await cacheService.cacheAISuggestions(req.user.userId, suggestions);
    
    res.json(suggestions);
  } catch (error) {
    console.error('Get AI suggestions error:', error);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
});

// Parse natural language input
router.post('/parse', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const parsedData = await aiService.parseNaturalLanguage(text);
    res.json(parsedData);
  } catch (error) {
    console.error('Parse natural language error:', error);
    res.status(500).json({ message: 'Error parsing input' });
  }
});

// Get user insights
router.get('/insights', auth, async (req, res) => {
  try {
    // Check cache first
    const cachedInsights = await cacheService.getCachedUserInsights(req.user.userId);
    if (cachedInsights) {
      return res.json(cachedInsights);
    }

    // Get user's reminders
    const reminders = await Reminder.find({
      user: req.user.userId,
      date: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    const insights = await aiService.generateInsights(reminders);
    
    // Cache the insights
    await cacheService.cacheUserInsights(req.user.userId, insights);
    
    res.json(insights);
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ message: 'Error generating insights' });
  }
});

// Get optimal time suggestion for a reminder
router.post('/optimal-time', auth, async (req, res) => {
  try {
    const { reminder } = req.body;
    if (!reminder) {
      return res.status(400).json({ message: 'Reminder data is required' });
    }

    // Get user's reminder history
    const userHistory = await Reminder.find({
      user: req.user.userId,
      category: reminder.category,
      isCompleted: true
    }).sort('-date').limit(10);

    const optimalTime = await aiService.predictOptimalTime(reminder, userHistory);
    res.json(optimalTime);
  } catch (error) {
    console.error('Get optimal time error:', error);
    res.status(500).json({ message: 'Error predicting optimal time' });
  }
});

// Get category suggestions for a reminder
router.post('/suggest-category', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Reminder title is required' });
    }

    const prompt = `Based on this reminder title: "${title}" ${description ? `and description: "${description}"` : ''}, 
      suggest the most appropriate category from: Work, Personal, Shopping, Health.
      Return only the category name.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 10
    });

    const suggestedCategory = completion.choices[0].message.content.trim();
    res.json({ category: suggestedCategory });
  } catch (error) {
    console.error('Category suggestion error:', error);
    res.status(500).json({ message: 'Error suggesting category' });
  }
});

// Get priority suggestions for a reminder
router.post('/suggest-priority', auth, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Reminder title is required' });
    }

    const prompt = `Based on this reminder title: "${title}" 
      ${description ? `description: "${description}"` : ''} 
      ${dueDate ? `and due date: "${dueDate}"` : ''}, 
      suggest the most appropriate priority level from: low, medium, high.
      Consider urgency and importance. Return only the priority level.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 10
    });

    const suggestedPriority = completion.choices[0].message.content.trim();
    res.json({ priority: suggestedPriority });
  } catch (error) {
    console.error('Priority suggestion error:', error);
    res.status(500).json({ message: 'Error suggesting priority' });
  }
});

export default router; 