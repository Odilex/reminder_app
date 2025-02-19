import OpenAI from 'openai';
import moment from 'moment-timezone';
import { db } from '../config/firebase.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  async initialize() {
    try {
      console.log('AI service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      return false;
    }
  }

  async generateSuggestions(reminders) {
    try {
      const prompt = `Based on these reminders: ${JSON.stringify(reminders)}, 
        suggest 3 potential new reminders that would be helpful for the user. 
        Consider patterns in timing, categories, and priorities. Format the response
        as a JSON array of objects with title, category, and priority properties.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const suggestions = JSON.parse(completion.choices[0].message.content);
      return suggestions;
    } catch (error) {
      console.error('Generate suggestions error:', error);
      return null;
    }
  }

  async parseNaturalLanguage(text) {
    try {
      const prompt = `Parse this reminder text: "${text}"
        Extract the following information and return it as a JSON object:
        - time: when the reminder should occur (extract both date and time if present)
        - category: the most appropriate category (work, personal, shopping, health, other)
        - priority: the priority level (low, medium, high) based on urgency words
        - title: a clear, concise title for the reminder
        - description: any additional details (if present)`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 200,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Parse natural language error:', error);
      return null;
    }
  }

  async generateInsights(reminders) {
    try {
      const prompt = `Analyze these reminders: ${JSON.stringify(reminders)}
        Generate insights about the user's patterns and habits.
        Include:
        - Most productive times of day
        - Most common categories
        - Completion rate patterns
        - Suggestions for improvement
        Return the analysis as a JSON object.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 500,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Generate insights error:', error);
      return null;
    }
  }

  async predictOptimalTime(reminder, userId) {
    try {
      // Get user's completed reminders of the same category
      const remindersRef = db.collection('reminders');
      const snapshot = await remindersRef
        .where('userId', '==', userId)
        .where('category', '==', reminder.category)
        .where('isCompleted', '==', true)
        .get();

      const completedReminders = snapshot.docs.map(doc => doc.data());

      const prompt = `Based on these completed reminders: ${JSON.stringify(completedReminders)},
        suggest an optimal time for a new ${reminder.category} reminder.
        Consider patterns in completion times and success rates.
        Return the result as a JSON object with time (HH:mm format) and confidence (0-1) properties.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 100,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Predict optimal time error:', error);
      return null;
    }
  }

  async processFeedback(suggestionId, isHelpful, feedback) {
    try {
      await db.collection('ai_feedback').add({
        suggestionId,
        isHelpful,
        feedback,
        timestamp: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Process feedback error:', error);
      return false;
    }
  }
}

export const aiService = new AIService(); 