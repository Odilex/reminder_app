import request from 'supertest';
import app from '../../app.js';
import { Reminder } from '../../models/reminder.js';
import { User } from '../../models/user.js';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

describe('Reminder Routes', () => {
  let testUser;
  let authToken;
  let mockFirebaseAuth;

  beforeEach(async () => {
    await setupTestDB();
    
    // Create a test user
    testUser = await User.create({
      email: 'test@example.com',
      displayName: 'Test User',
      firebaseUid: 'test-firebase-uid'
    });

    // Get mocked Firebase module
    const firebaseAdmin = await import('firebase-admin');
    mockFirebaseAuth = firebaseAdmin.default.auth();

    // Mock Firebase token verification
    mockFirebaseAuth.verifyIdToken.mockResolvedValue({
      uid: testUser.firebaseUid,
      email: testUser.email
    });

    // Get auth token
    const response = await request(app)
      .post('/api/auth/verify-token')
      .send({ idToken: 'mock-firebase-token' });
    
    authToken = response.body.token;
  });

  describe('POST /api/reminders', () => {
    it('should create a new reminder', async () => {
      const reminderData = {
        title: 'Test Reminder',
        description: 'Test Description',
        dueDate: new Date().toISOString(),
        category: 'work',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reminderData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(reminderData.title);
      expect(response.body.userId).toBe(testUser._id.toString());

      // Verify reminder was saved to database
      const savedReminder = await Reminder.findById(response.body._id);
      expect(savedReminder).toBeTruthy();
      expect(savedReminder.title).toBe(reminderData.title);
    });

    it('should return 400 for invalid reminder data', async () => {
      const invalidData = {
        // Missing required fields
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('GET /api/reminders', () => {
    it('should return user\'s reminders', async () => {
      // Create test reminders
      await Reminder.create([
        {
          title: 'Reminder 1',
          description: 'Description 1',
          dueDate: new Date(),
          category: 'work',
          priority: 'high',
          userId: testUser._id
        },
        {
          title: 'Reminder 2',
          description: 'Description 2',
          dueDate: new Date(),
          category: 'personal',
          priority: 'medium',
          userId: testUser._id
        }
      ]);

      const response = await request(app)
        .get('/api/reminders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].userId).toBe(testUser._id.toString());
    });

    it('should filter reminders by category', async () => {
      // Create test reminders
      await Reminder.create([
        {
          title: 'Work Reminder',
          description: 'Description',
          dueDate: new Date(),
          category: 'work',
          priority: 'high',
          userId: testUser._id
        },
        {
          title: 'Personal Reminder',
          description: 'Description',
          dueDate: new Date(),
          category: 'personal',
          priority: 'medium',
          userId: testUser._id
        }
      ]);

      const response = await request(app)
        .get('/api/reminders')
        .query({ category: 'work' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].category).toBe('work');
    });
  });

  describe('PUT /api/reminders/:id', () => {
    it('should update a reminder', async () => {
      const reminder = await Reminder.create({
        title: 'Original Title',
        description: 'Original Description',
        dueDate: new Date(),
        category: 'work',
        priority: 'high',
        userId: testUser._id
      });

      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/reminders/${reminder._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);

      // Verify update in database
      const updatedReminder = await Reminder.findById(reminder._id);
      expect(updatedReminder.title).toBe(updateData.title);
    });

    it('should return 404 for non-existent reminder', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/reminders/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/reminders/:id', () => {
    it('should delete a reminder', async () => {
      const reminder = await Reminder.create({
        title: 'To Be Deleted',
        description: 'Description',
        dueDate: new Date(),
        category: 'work',
        priority: 'high',
        userId: testUser._id
      });

      const response = await request(app)
        .delete(`/api/reminders/${reminder._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify deletion
      const deletedReminder = await Reminder.findById(reminder._id);
      expect(deletedReminder).toBeNull();
    });

    it('should return 404 for non-existent reminder', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/reminders/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
}); 