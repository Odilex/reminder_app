import { db } from '../config/firebase.js';
import Reminder from '../models/Reminder.js';
import User from '../models/User.js';
import { cacheService } from './cache.js';

class SyncService {
  constructor() {
    this.setupFirebaseListeners();
  }

  // Set up Firebase real-time listeners
  setupFirebaseListeners() {
    // Listen for reminder changes in Firebase
    db.collection('reminders').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          this.syncReminderToMongo(change.doc.id, change.doc.data());
        } else if (change.type === 'removed') {
          this.deleteReminderFromMongo(change.doc.id);
        }
      });
    });

    // Listen for user changes in Firebase
    db.collection('users').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          this.syncUserToMongo(change.doc.id, change.doc.data());
        }
      });
    });
  }

  // Sync reminder from Firebase to MongoDB
  async syncReminderToMongo(reminderId, reminderData) {
    try {
      const reminder = await Reminder.findOne({ firebaseId: reminderId });
      
      if (reminder) {
        // Update existing reminder
        Object.assign(reminder, this.transformReminderData(reminderData));
        await reminder.save();
      } else {
        // Create new reminder
        await Reminder.create({
          ...this.transformReminderData(reminderData),
          firebaseId: reminderId
        });
      }

      // Clear cache for the user
      await cacheService.clearUserCache(reminderData.userId);
    } catch (error) {
      console.error('Sync reminder to MongoDB error:', error);
    }
  }

  // Delete reminder from MongoDB
  async deleteReminderFromMongo(reminderId) {
    try {
      const reminder = await Reminder.findOne({ firebaseId: reminderId });
      if (reminder) {
        await reminder.deleteOne();
        await cacheService.clearUserCache(reminder.user.toString());
      }
    } catch (error) {
      console.error('Delete reminder from MongoDB error:', error);
    }
  }

  // Sync user from Firebase to MongoDB
  async syncUserToMongo(firebaseUid, userData) {
    try {
      const user = await User.findOne({ firebaseUid });
      
      if (user) {
        // Update existing user
        Object.assign(user, this.transformUserData(userData));
        await user.save();
      } else {
        // Create new user
        await User.create({
          ...this.transformUserData(userData),
          firebaseUid
        });
      }
    } catch (error) {
      console.error('Sync user to MongoDB error:', error);
    }
  }

  // Sync reminder from MongoDB to Firebase
  async syncReminderToFirebase(reminder) {
    try {
      const reminderData = this.transformReminderToFirebase(reminder);
      
      if (reminder.firebaseId) {
        await db.collection('reminders').doc(reminder.firebaseId).set(reminderData);
      } else {
        const docRef = await db.collection('reminders').add(reminderData);
        reminder.firebaseId = docRef.id;
        await reminder.save();
      }
    } catch (error) {
      console.error('Sync reminder to Firebase error:', error);
    }
  }

  // Transform reminder data from Firebase to MongoDB format
  transformReminderData(data) {
    return {
      title: data.title,
      date: data.date.toDate(),
      time: data.time,
      category: data.category,
      priority: data.priority,
      isCompleted: data.isCompleted,
      isLocationBased: data.isLocationBased,
      location: data.location,
      isRecurring: data.isRecurring,
      recurringPattern: data.recurringPattern,
      user: data.userId
    };
  }

  // Transform user data from Firebase to MongoDB format
  transformUserData(data) {
    return {
      email: data.email,
      displayName: data.displayName,
      emailVerified: data.emailVerified,
      preferences: data.preferences,
      stats: data.stats
    };
  }

  // Transform reminder to Firebase format
  transformReminderToFirebase(reminder) {
    return {
      title: reminder.title,
      date: new Date(reminder.date),
      time: reminder.time,
      category: reminder.category,
      priority: reminder.priority,
      isCompleted: reminder.isCompleted,
      isLocationBased: reminder.isLocationBased,
      location: reminder.location,
      isRecurring: reminder.isRecurring,
      recurringPattern: reminder.recurringPattern,
      userId: reminder.user.toString(),
      updatedAt: new Date()
    };
  }

  // Check and repair data consistency
  async checkConsistency() {
    try {
      // Get all reminders from both sources
      const mongoReminders = await Reminder.find();
      const firebaseReminders = await db.collection('reminders').get();

      // Create maps for easy lookup
      const mongoMap = new Map(mongoReminders.map(r => [r.firebaseId, r]));
      const firebaseMap = new Map(firebaseReminders.docs.map(d => [d.id, d.data()]));

      // Check MongoDB -> Firebase
      for (const [firebaseId, mongoReminder] of mongoMap) {
        if (firebaseId && !firebaseMap.has(firebaseId)) {
          // Reminder exists in MongoDB but not in Firebase
          await this.syncReminderToFirebase(mongoReminder);
        }
      }

      // Check Firebase -> MongoDB
      for (const [firebaseId, firebaseReminder] of firebaseMap) {
        if (!mongoMap.has(firebaseId)) {
          // Reminder exists in Firebase but not in MongoDB
          await this.syncReminderToMongo(firebaseId, firebaseReminder);
        }
      }
    } catch (error) {
      console.error('Check consistency error:', error);
    }
  }
}

export const syncService = new SyncService(); 