import OpenAI from 'openai';
import { NlpManager } from 'node-nlp';
import moment from 'moment-timezone';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const nlpManager = new NlpManager({ languages: ['en'] });

// Train NLP manager with common reminder patterns
async function trainNLP() {
  // Time expressions
  nlpManager.addDocument('en', 'tomorrow', 'time.tomorrow');
  nlpManager.addDocument('en', 'next week', 'time.next_week');
  nlpManager.addDocument('en', 'in 2 days', 'time.in_days');
  nlpManager.addDocument('en', 'next month', 'time.next_month');

  // Categories
  nlpManager.addDocument('en', 'work meeting', 'category.work');
  nlpManager.addDocument('en', 'doctor appointment', 'category.health');
  nlpManager.addDocument('en', 'shopping list', 'category.shopping');
  nlpManager.addDocument('en', 'personal task', 'category.personal');

  // Priority levels
  nlpManager.addDocument('en', 'urgent', 'priority.high');
  nlpManager.addDocument('en', 'important', 'priority.high');
  nlpManager.addDocument('en', 'can wait', 'priority.low');
  nlpManager.addDocument('en', 'when possible', 'priority.low');

  await nlpManager.train();
}

trainNLP();

export const aiService = {
  // Generate smart reminder suggestions based on user patterns
  async generateSuggestions(userReminders) {
    try {
      const prompt = `Based on these reminders: ${JSON.stringify(userReminders)}, 
        suggest 3 potential new reminders that would be helpful for the user. 
        Consider patterns in timing, categories, and priorities.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI suggestion error:', error);
      return [];
    }
  },

  // Parse natural language input to structured reminder data
  async parseNaturalLanguage(text) {
    try {
      const result = await nlpManager.process('en', text);
      const entities = {};

      // Extract date/time
      const dateTimeMatch = await this.extractDateTime(text);
      if (dateTimeMatch) {
        entities.date = dateTimeMatch.date;
        entities.time = dateTimeMatch.time;
      }

      // Extract category
      const categoryMatch = result.entities.find(e => e.entity.startsWith('category'));
      if (categoryMatch) {
        entities.category = categoryMatch.entity.split('.')[1];
      }

      // Extract priority
      const priorityMatch = result.entities.find(e => e.entity.startsWith('priority'));
      if (priorityMatch) {
        entities.priority = priorityMatch.entity.split('.')[1];
      }

      return entities;
    } catch (error) {
      console.error('Natural language parsing error:', error);
      return {};
    }
  },

  // Extract date and time from text
  async extractDateTime(text) {
    try {
      const prompt = `Extract the date and time from this text: "${text}". 
        Return only a JSON object with "date" in ISO format and "time" in 12-hour format.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 100
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('DateTime extraction error:', error);
      return null;
    }
  },

  // Analyze reminder patterns and generate insights
  async generateInsights(userReminders) {
    try {
      const prompt = `Analyze these reminders: ${JSON.stringify(userReminders)}. 
        Provide insights about: 
        1. Most common categories
        2. Typical scheduling patterns
        3. Task completion rates
        4. Suggestions for better time management
        Return as JSON.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 300
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Insight generation error:', error);
      return {};
    }
  },

  // Predict optimal reminder times based on user patterns
  async predictOptimalTime(reminder, userHistory) {
    try {
      const prompt = `Given this reminder: ${JSON.stringify(reminder)} 
        and user history: ${JSON.stringify(userHistory)}, 
        suggest the optimal time for this reminder based on:
        1. User's typical active hours
        2. Similar reminder patterns
        3. Task completion success rates
        Return only a JSON with suggested "date" and "time".`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 100
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Time prediction error:', error);
      return null;
    }
  }
}; 