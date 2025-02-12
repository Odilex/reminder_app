import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { auth as firebaseAuth } from '../config/firebase.js';

const router = express.Router();

// ... existing validation middleware ...

// Update FCM token
router.post('/fcm-token', auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fcmToken = fcmToken;
    await user.save();

    res.json({ message: 'FCM token updated successfully' });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Firebase token and create session
router.post('/verify-firebase-token', async (req, res) => {
  try {
    const { firebaseToken } = req.body;
    if (!firebaseToken) {
      return res.status(400).json({ message: 'Firebase token is required' });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(firebaseToken);
    const firebaseUser = await firebaseAuth.getUser(decodedToken.uid);

    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      user = new User({
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        firebaseUid: decodedToken.uid,
        emailVerified: firebaseUser.emailVerified
      });
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Verify Firebase token error:', error);
    res.status(401).json({ message: 'Invalid Firebase token' });
  }
});

// ... existing routes ...

export default router; 