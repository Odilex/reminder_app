import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { aiService } from '../services/ai.js';
import { cacheService } from '../services/cache.js';
import { db } from '../config/firebase.js';

const router = express.Router();

// Get AI-generated suggestions for the user
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const cacheKey = `suggestions:${req.user.uid}`;
    const cachedSuggestions = await cacheService.get(cacheKey);
    
    if (cachedSuggestions) {
      return res.json(cachedSuggestions);
    }

    // Get user's reminders from Firestore
    const remindersRef = db.collection('reminders');
    const remindersSnapshot = await remindersRef
      .where('userId', '==', req.user.uid)
      .orderBy('date', 'desc')
      .limit(50)
      .get();

    const reminders = remindersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Generate suggestions using the AI service
    const suggestions = await aiService.generateSuggestions(reminders);

    // Cache the suggestions for 30 minutes
    await cacheService.set(cacheKey, suggestions, 1800);

    res.json(suggestions);
  } catch (error) {
    console.error('Get AI suggestions error:', error);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
});

// Parse natural language input for reminder creation
router.post('/parse', authMiddleware, async (req, res) => {
  try {
    const { input } = req.body;
    
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ message: 'Valid input text is required' });
    }

    const parsedData = await aiService.parseNaturalLanguage(input);
    
    if (!parsedData) {
      return res.status(422).json({ message: 'Could not parse the input' });
    }

    res.json(parsedData);
  } catch (error) {
    console.error('Parse natural language error:', error);
    res.status(500).json({ message: 'Error parsing input' });
  }
});

// Get insights about user's reminder patterns
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const cacheKey = `insights:${req.user.uid}`;
    const cachedInsights = await cacheService.get(cacheKey);
    
    if (cachedInsights) {
      return res.json(cachedInsights);
    }

    // Get user's reminders from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const remindersRef = db.collection('reminders');
    const remindersSnapshot = await remindersRef
      .where('userId', '==', req.user.uid)
      .where('date', '>=', thirtyDaysAgo)
      .get();

    const reminders = remindersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Generate insights using the AI service
    const insights = await aiService.generateInsights(reminders);

    // Cache insights for 1 hour
    await cacheService.set(cacheKey, insights, 3600);

    res.json(insights);
  } catch (error) {
    console.error('Get AI insights error:', error);
    res.status(500).json({ message: 'Error generating insights' });
  }
});

// Train AI model with user feedback
router.post('/feedback', authMiddleware, async (req, res) => {
  try {
    const { suggestionId, isHelpful, feedback } = req.body;
    
    if (!suggestionId) {
      return res.status(400).json({ message: 'Suggestion ID is required' });
    }

    // Store feedback in Firestore
    await db.collection('ai_feedback').add({
      userId: req.user.uid,
      suggestionId,
      isHelpful,
      feedback,
      timestamp: new Date()
    });

    // Update AI model with the feedback
    await aiService.processFeedback(suggestionId, isHelpful, feedback);

    res.json({ message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error('AI feedback error:', error);
    res.status(500).json({ message: 'Error processing feedback' });
  }
});

export default router; 