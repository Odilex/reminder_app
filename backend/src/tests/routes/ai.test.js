import request from 'supertest';
import app from '../../app.js';
import { User } from '../../models/user.js';
import { jest } from '@jest/globals';

describe('AI Routes', () => {
  let testUser;
  let authToken;
  let mockOpenAI;
  let mockFirebaseAuth;

  beforeEach(async () => {
    await setupTestDB();
    
    // Create a test user
    testUser = await User.create({
      email: 'test@example.com',
      displayName: 'Test User',
      firebaseUid: 'test-firebase-uid'
    });

    // Get mocked modules
    const firebaseAdmin = await import('firebase-admin');
    mockFirebaseAuth = firebaseAdmin.default.auth();
    const OpenAI = (await import('openai')).default;
    mockOpenAI = new OpenAI();

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

  describe('POST /api/ai/suggest-category', () => {
    it('should suggest a category for a reminder', async () => {
      // Mock OpenAI response
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'work'
            }
          }
        ]
      });

      const reminderData = {
        title: 'Prepare presentation for client meeting',
        description: 'Create slides and gather metrics for quarterly review'
      };

      const response = await request(app)
        .post('/api/ai/suggest-category')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reminderData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('category');
      expect(typeof response.body.category).toBe('string');
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        // Missing title
        description: 'Some description'
      };

      const response = await request(app)
        .post('/api/ai/suggest-category')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeTruthy();
    });

    it('should handle OpenAI API errors gracefully', async () => {
      // Mock OpenAI error
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const reminderData = {
        title: 'Test Reminder',
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/ai/suggest-category')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reminderData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBeTruthy();
    });
  });

  describe('POST /api/ai/suggest-priority', () => {
    it('should suggest a priority for a reminder', async () => {
      // Mock OpenAI response
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'high'
            }
          }
        ]
      });

      const reminderData = {
        title: 'Client Presentation',
        description: 'Important meeting with key stakeholders',
        dueDate: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/ai/suggest-priority')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reminderData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('priority');
      expect(typeof response.body.priority).toBe('string');
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        // Missing required fields
        title: 'Test'
      };

      const response = await request(app)
        .post('/api/ai/suggest-priority')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeTruthy();
    });

    it('should handle OpenAI API errors gracefully', async () => {
      // Mock OpenAI error
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const reminderData = {
        title: 'Test Reminder',
        description: 'Test Description',
        dueDate: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/ai/suggest-priority')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reminderData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBeTruthy();
    });
  });
}); 