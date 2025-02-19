import { db } from '../config/firebase.js';

const usersCollection = db.collection('users');

class User {
  static async create(userData) {
    const { email, displayName, firebaseUid, fcmToken = null } = userData;
    
    const user = {
      email,
      displayName,
      firebaseUid,
      fcmToken,
      emailVerified: false,
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: true
        },
        timezone: 'UTC'
      },
      stats: {
        totalReminders: 0,
        completedReminders: 0,
        streakDays: 0,
        lastActive: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await usersCollection.doc(firebaseUid).set(user);
    return user;
  }

  static async findByUid(uid) {
    const doc = await usersCollection.doc(uid).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async findByEmail(email) {
    const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  static async update(uid, updateData) {
    const updates = {
      ...updateData,
      updatedAt: new Date()
    };
    await usersCollection.doc(uid).update(updates);
    return this.findByUid(uid);
  }

  static async delete(uid) {
    await usersCollection.doc(uid).delete();
  }

  static async updateStats(uid, stats) {
    const updates = {
      'stats': stats,
      updatedAt: new Date()
    };
    await usersCollection.doc(uid).update(updates);
  }

  static async updatePreferences(uid, preferences) {
    const updates = {
      'preferences': preferences,
      updatedAt: new Date()
    };
    await usersCollection.doc(uid).update(updates);
  }
}

export default User;