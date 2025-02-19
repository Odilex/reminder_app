import cron from 'node-cron';
import moment from 'moment-timezone';
import { messaging, db } from '../config/firebase.js';
import { aiService } from './ai.js';

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  async initialize() {
    try {
      await this.createRequiredIndexes();
      this.initializeJobs();
      console.log('Scheduler service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize scheduler service:', error);
    }
  }

  async createRequiredIndexes() {
    try {
      // Log index creation requirements
      console.log('Required Firestore indexes:');
      console.log('1. Collection: reminders');
      console.log('   Fields: isCompleted (Ascending), date (Ascending)');
      console.log('Please create the index at:');
      console.log('https://console.firebase.google.com/project/reminder-app-fbdec/firestore/indexes');
    } catch (error) {
      console.error('Error checking indexes:', error);
    }
  }

  initializeJobs() {
    // Daily task to process recurring reminders
    cron.schedule('0 0 * * *', () => this.processRecurringReminders());

    // Hourly task to send upcoming reminder notifications
    cron.schedule('0 * * * *', () => this.sendUpcomingReminders());

    // Weekly task to generate user insights
    cron.schedule('0 0 * * 0', () => this.generateWeeklyInsights());

    // Daily task to generate AI suggestions
    cron.schedule('0 12 * * *', () => this.generateDailySuggestions());
  }

  async processRecurringReminders() {
    try {
      const now = moment().startOf('day');
      const remindersRef = db.collection('reminders');
      const snapshot = await remindersRef
        .where('recurrence', '!=', null)
        .get();
      
      for (const doc of snapshot.docs) {
        const reminder = { id: doc.id, ...doc.data() };
        const nextOccurrence = this.calculateNextOccurrence(reminder);
        if (nextOccurrence) {
          const newReminder = {
            ...reminder,
            date: nextOccurrence.toDate(),
            recurrence: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          delete newReminder.id;

          await remindersRef.add(newReminder);
        }
      }
    } catch (error) {
      console.error('Process recurring reminders error:', error);
    }
  }

  calculateNextOccurrence(reminder) {
    const currentDate = moment();
    const reminderDate = moment(reminder.date);
    
    switch (reminder.recurrence) {
      case 'daily':
        return reminderDate.add(1, 'day');
      case 'weekly':
        return reminderDate.add(1, 'week');
      case 'monthly':
        return reminderDate.add(1, 'month');
      case 'yearly':
        return reminderDate.add(1, 'year');
      default:
        return null;
    }
  }

  async sendUpcomingReminders() {
    try {
      const now = moment().toDate();
      const oneHourFromNow = moment().add(1, 'hour').toDate();
      
      // First, get all reminders within the time range
      const remindersRef = db.collection('reminders');
      const snapshot = await remindersRef
        .where('date', '>=', now)
        .where('date', '<=', oneHourFromNow)
        .get();

      // Then filter for incomplete reminders in memory
      const upcomingReminders = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(reminder => !reminder.isCompleted);

      // Send notifications for each reminder
      for (const reminder of upcomingReminders) {
        await this.sendPushNotification(reminder);
      }
    } catch (error) {
      if (error.code === 9 && error.message.includes('requires an index')) {
        console.error('Missing Firestore index. Please create the required index at:');
        console.error(error.details);
      } else {
        console.error('Send upcoming reminders error:', error);
      }
    }
  }

  async sendPushNotification(reminder) {
    try {
      const usersRef = db.collection('users');
      const userDoc = await usersRef.doc(reminder.userId).get();
      const user = userDoc.data();

      if (!user?.fcmToken) {
        return;
      }

      const message = {
        notification: {
          title: reminder.title,
          body: reminder.description || 'Time for your reminder!',
        },
        data: {
          reminderId: reminder.id,
          type: 'reminder',
        },
        token: user.fcmToken,
      };

      await messaging.send(message);
    } catch (error) {
      console.error('Send push notification error:', error);
    }
  }

  async generateUserInsights(user) {
    try {
      const oneWeekAgo = moment().subtract(7, 'days').toDate();
      const remindersRef = db.collection('reminders');
      const snapshot = await remindersRef
        .where('userId', '==', user.id)
        .where('date', '>=', oneWeekAgo)
        .get();

      const reminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate basic insights
      const totalReminders = reminders.length;
      const completedReminders = reminders.filter(r => r.isCompleted).length;
      const completionRate = totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0;

      // Category breakdown
      const categoryBreakdown = reminders.reduce((acc, reminder) => {
        acc[reminder.category] = (acc[reminder.category] || 0) + 1;
        return acc;
      }, {});

      // Most active days
      const dayBreakdown = reminders.reduce((acc, reminder) => {
        const day = moment(reminder.date).format('dddd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      return {
        period: {
          start: oneWeekAgo,
          end: new Date(),
        },
        stats: {
          total: totalReminders,
          completed: completedReminders,
          completionRate: Math.round(completionRate),
        },
        categories: categoryBreakdown,
        activeDays: dayBreakdown,
      };
    } catch (error) {
      console.error('Generate user insights error:', error);
      return null;
    }
  }

  async generateWeeklyInsights() {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.get();

      for (const doc of snapshot.docs) {
        const user = { id: doc.id, ...doc.data() };
        const insights = await this.generateUserInsights(user);
        if (insights) {
          await this.sendInsightNotification(user, insights);
        }
      }
    } catch (error) {
      console.error('Generate weekly insights error:', error);
    }
  }

  async generateDailySuggestions() {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.get();

      for (const doc of snapshot.docs) {
        const user = { id: doc.id, ...doc.data() };
        const suggestions = await aiService.generateSuggestions(user);
        if (suggestions) {
          await this.sendSuggestionsNotification(user, suggestions);
        }
      }
    } catch (error) {
      console.error('Generate daily suggestions error:', error);
    }
  }

  async sendInsightNotification(user, insights) {
    if (!user.fcmToken) {
      return;
    }

    const message = {
      notification: {
        title: 'Your Weekly Insights',
        body: 'Check out your productivity insights for this week!',
      },
      data: {
        type: 'insights',
        insights: JSON.stringify(insights),
      },
      token: user.fcmToken,
    };

    try {
      await messaging.send(message);
    } catch (error) {
      console.error('Send insight notification error:', error);
    }
  }

  async sendSuggestionsNotification(user, suggestions) {
    if (!user.fcmToken) {
      return;
    }

    const message = {
      notification: {
        title: 'AI Suggestions',
        body: 'We have some personalized suggestions for you!',
      },
      data: {
        type: 'suggestions',
        suggestions: JSON.stringify(suggestions),
      },
      token: user.fcmToken,
    };

    try {
      await messaging.send(message);
    } catch (error) {
      console.error('Send suggestions notification error:', error);
    }
  }
}

export const schedulerService = new SchedulerService(); 