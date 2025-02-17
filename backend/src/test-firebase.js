import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

console.log('Starting Firebase test...');
console.log('Environment loaded:', process.env.NODE_ENV);
console.log('Firebase Project ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set');

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

try {
  console.log('Attempting to initialize Firebase...');
  
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  
  console.log('Firebase Admin initialized successfully');
  
  // Test Firebase functionality
  const defaultAuth = admin.auth();
  console.log('Firebase Auth initialized');
  
  const defaultFirestore = admin.firestore();
  console.log('Firebase Firestore initialized');
  
  process.exit(0);
} catch (error) {
  console.error('Firebase initialization error:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Full error:', error);
  process.exit(1);
} 