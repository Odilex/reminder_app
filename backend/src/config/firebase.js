import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: "googleapis.com"
};

let firebaseApp;

try {
  // Initialize Firebase Admin if not already initialized
  if (!admin.apps.length) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    firebaseApp = admin.app();
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Don't throw the error, just log it and continue
  // This allows the app to start even if Firebase fails
}

// Initialize services with null fallback if Firebase fails to initialize
export const auth = firebaseApp ? admin.auth() : null;
export const db = firebaseApp ? admin.firestore() : null;
export const storage = firebaseApp ? admin.storage() : null;
export const messaging = firebaseApp ? admin.messaging() : null;

// Initialize Firestore with settings to help with connection issues
if (db) {
  db.settings({
    ignoreUndefinedProperties: true
  });
}

export default admin; 