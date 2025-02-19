import { db } from '../config/firebase.js';

const remindersCollection = db.collection('reminders');

class Reminder {
  static async create(reminderData) {
    const {
      title,
      description = '',
      date,
      time,
      category,
      priority,
      userId,
      isLocationBased = false,
      location = null,
      recurrence = null,
      attachments = [],
      sharedWith = [],
    } = reminderData;

    const reminder = {
      title,
      description,
      date: new Date(date),
      time,
      category,
      priority,
      userId,
      isCompleted: false,
      isLocationBased,
      location: location ? {
        name: location.name,
    coordinates: {
          type: 'Point',
          coordinates: location.coordinates,
        },
      } : null,
      recurrence,
      attachments,
      sharedWith,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await remindersCollection.add(reminder);
    return { id: docRef.id, ...reminder };
  }

  static async findById(id) {
    const doc = await remindersCollection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async findByUser(userId, filters = {}) {
    let query = remindersCollection.where('userId', '==', userId);

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    if (filters.isCompleted !== undefined) {
      query = query.where('isCompleted', '==', filters.isCompleted);
    }
    if (filters.priority) {
      query = query.where('priority', '==', filters.priority);
    }
    if (filters.startDate) {
      query = query.where('date', '>=', new Date(filters.startDate));
    }
    if (filters.endDate) {
      query = query.where('date', '<=', new Date(filters.endDate));
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async update(id, updateData) {
    const updates = {
      ...updateData,
      updatedAt: new Date(),
    };
    await remindersCollection.doc(id).update(updates);
    return this.findById(id);
  }

  static async delete(id) {
    await remindersCollection.doc(id).delete();
  }

  static async markComplete(id, isCompleted = true) {
    const updates = {
      isCompleted,
      updatedAt: new Date(),
    };
    await remindersCollection.doc(id).update(updates);
    return this.findById(id);
  }

  static async shareWith(id, userIds) {
    const updates = {
      sharedWith: userIds,
      updatedAt: new Date(),
    };
    await remindersCollection.doc(id).update(updates);
    return this.findById(id);
  }

  static async findSharedWithUser(userId) {
    const snapshot = await remindersCollection
      .where('sharedWith', 'array-contains', userId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findByLocation(coordinates, radius) {
    // Note: Firestore doesn't support geospatial queries directly
    // For location-based queries, you might want to use Firebase Realtime Database
    // or implement a different solution (like using a geohashing library)
    throw new Error('Location-based queries are not implemented in Firestore');
  }
}

export default Reminder; 