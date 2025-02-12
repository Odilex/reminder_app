import cron from 'node-cron';
import moment from 'moment-timezone';
import { messaging } from '../config/firebase.js';
import Reminder from '../models/Reminder.js';
import { aiService } from './ai.js';

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.initializeJobs();
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

  // Process recurring reminders
  async processRecurringReminders() {
    try {
      const today = moment().startOf('day');
      const reminders = await Reminder.find({ isRecurring: true });

      for (const reminder of reminders) {
        const nextOccurrence = this.calculateNextOccurrence(reminder);
        if (nextOccurrence) {
          const newReminder = new Reminder({
            ...reminder.toObject(),
            date: nextOccurrence.toDate(),
            isRecurring: false,
            _id: undefined
          });

          await newReminder.save();
        }
      }
    } catch (error) {
      console.error('Process recurring reminders error:', error);
    }
  }

  // Calculate next occurrence based on recurring pattern
  calculateNextOccurrence(reminder) {
    const currentDate = moment();
    const reminderDate = moment(reminder.date);

    switch (reminder.recurringPattern) {
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

  // Send notifications for upcoming reminders
  async sendUpcomingReminders() {
    try {
      const now = moment();
      const oneHourFromNow = moment().add(1, 'hour');

      const upcomingReminders = await Reminder.find({
        date: {
          $gte: now.toDate(),
          $lte: oneHourFromNow.toDate()
        },
        isCompleted: false
      }).populate('user');

      for (const reminder of upcomingReminders) {
        if (reminder.user.fcmToken) {
          await this.sendPushNotification(reminder);
        }
      }
    } catch (error) {
      console.error('Send upcoming reminders error:', error);
    }
  }

  // Send push notification
  async sendPushNotification(reminder) {
    try {
      const message = {
        notification: {
          title: 'Upcoming Reminder',
          body: reminder.title
        },
        data: {
          reminderId: reminder._id.toString(),
          category: reminder.category,
          priority: reminder.priority
        },
        token: reminder.user.fcmToken
      };

      await messaging.send(message);
    } catch (error) {
      console.error('Send push notification error:', error);
    }
  }

  // Generate weekly insights for users
  async generateWeeklyInsights() {
    try {
      const users = await User.find();
      
      for (const user of users) {
        const userReminders = await Reminder.find({
          user: user._id,
          date: {
            $gte: moment().subtract(7, 'days').toDate()
          }
        });

        const insights = await aiService.generateInsights(userReminders);
        
        // Store insights in user's profile or send as notification
        if (insights && user.fcmToken) {
          await this.sendInsightNotification(user, insights);
        }
      }
    } catch (error) {
      console.error('Generate weekly insights error:', error);
    }
  }

  // Generate daily AI suggestions
  async generateDailySuggestions() {
    try {
      const users = await User.find();
      
      for (const user of users) {
        const userReminders = await Reminder.find({
          user: user._id,
          date: {
            $gte: moment().subtract(30, 'days').toDate()
          }
        });

        const suggestions = await aiService.generateSuggestions(userReminders);
        
        if (suggestions && user.fcmToken) {
          await this.sendSuggestionsNotification(user, suggestions);
        }
      }
    } catch (error) {
      console.error('Generate daily suggestions error:', error);
    }
  }

  // Send insights notification
  async sendInsightNotification(user, insights) {
    try {
      const message = {
        notification: {
          title: 'Weekly Productivity Insights',
          body: 'Check out your reminder patterns and suggestions!'
        },
        data: {
          type: 'insights',
          insights: JSON.stringify(insights)
        },
        token: user.fcmToken
      };

      await messaging.send(message);
    } catch (error) {
      console.error('Send insights notification error:', error);
    }
  }

  // Send suggestions notification
  async sendSuggestionsNotification(user, suggestions) {
    try {
      const message = {
        notification: {
          title: 'Smart Reminder Suggestions',
          body: 'We have some reminder suggestions based on your patterns!'
        },
        data: {
          type: 'suggestions',
          suggestions: JSON.stringify(suggestions)
        },
        token: user.fcmToken
      };

      await messaging.send(message);
    } catch (error) {
      console.error('Send suggestions notification error:', error);
    }
  }

  // Schedule a specific reminder
  scheduleReminder(reminder) {
    const scheduledTime = moment(reminder.date).subtract(1, 'hour');
    const cronExpression = this.convertToCronExpression(scheduledTime);

    if (cronExpression) {
      const job = cron.schedule(cronExpression, () => {
        this.sendPushNotification(reminder);
      });

      this.jobs.set(reminder._id.toString(), job);
    }
  }

  // Convert date to cron expression
  convertToCronExpression(date) {
    return `${date.minutes()} ${date.hours()} ${date.date()} ${date.month() + 1} *`;
  }

  // Cancel a scheduled reminder
  cancelReminder(reminderId) {
    const job = this.jobs.get(reminderId);
    if (job) {
      job.stop();
      this.jobs.delete(reminderId);
    }
  }
}

export const schedulerService = new SchedulerService(); 