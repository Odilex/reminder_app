import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../config/firebase.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Update FCM token
router.post('/fcm-token', authMiddleware, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    await User.update(req.user.uid, { fcmToken });
    res.json({ message: 'FCM token updated successfully' });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Firebase token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const firebaseUser = await auth.getUser(decodedToken.uid);

    // Find or create user in Firestore
    let user = await User.findByUid(decodedToken.uid);
    if (!user) {
      user = await User.create({
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        firebaseUid: decodedToken.uid,
        emailVerified: firebaseUser.emailVerified,
      });
    }

    res.json({
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        preferences: user.preferences,
      },
      token,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      preferences: user.preferences,
      stats: user.stats,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', [
  authMiddleware,
  body('displayName').optional().trim().isLength({ min: 2 }),
  body('preferences').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { displayName, preferences } = req.body;
    const updates = {};

    if (displayName) {
      updates.displayName = displayName;
    }
    if (preferences) {
      updates.preferences = preferences;
    }

    const user = await User.update(req.user.uid, updates);
    res.json({
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    await auth.deleteUser(req.user.uid);
    await User.delete(req.user.uid);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 