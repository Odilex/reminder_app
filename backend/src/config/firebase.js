import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getMessaging } from 'firebase-admin/messaging';
import dotenv from 'dotenv';

dotenv.config();

let auth, db, storage, messaging, app;

try {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  };

  // Initialize Firebase Admin
  app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  messaging = getMessaging(app);

  console.log('Firebase Admin SDK initialized successfully');
  console.log('Important: Make sure the following APIs are enabled in your Firebase project:');
  console.log('1. Cloud Firestore API');
  console.log('2. Cloud Storage API');
  console.log('3. Cloud Messaging API');
  console.log(`Enable them at: https://console.developers.google.com/apis/library?project=${process.env.FIREBASE_PROJECT_ID}`);

  // Test Firebase connection without immediately failing
  (async () => {
    try {
      const testDoc = db.collection('system_health').doc('test');
      await testDoc.set({ timestamp: new Date() });
      await testDoc.delete();
      console.log('Firebase Firestore connection test successful');
    } catch (error) {
      if (error.code === 7 && error.reason === 'SERVICE_DISABLED') {
        console.error('Firebase Firestore API is not enabled. Please enable it in the Google Cloud Console.');
        console.error(`Enable URL: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${process.env.FIREBASE_PROJECT_ID}`);
      } else {
        console.error('Firebase connection test failed:', error.message);
      }
    }
  })();

} catch (error) {
  console.error('Firebase initialization error:', error);
  if (error.code === 'app/invalid-credential') {
    console.error('Invalid Firebase credentials. Please check your service account configuration.');
  }
  throw error;
}

export { auth, db, storage, messaging };
export default app; 