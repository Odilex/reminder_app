import jwt from 'jsonwebtoken';
import { auth as firebaseAuth } from '../config/firebase.js';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };

    // Verify Firebase token if provided
    const firebaseToken = req.header('Firebase-Token');
    if (firebaseToken) {
      try {
        const decodedFirebaseToken = await firebaseAuth.verifyIdToken(firebaseToken);
        req.firebaseUser = decodedFirebaseToken;
      } catch (error) {
        console.error('Firebase token verification error:', error);
      }
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth; 