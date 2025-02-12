import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAAucSCTqMR-t0lX8HX3kMOVR1mACbWdA4",
  authDomain: "reminder-app-fbdec.firebaseapp.com",
  projectId: "reminder-app-fbdec",
  storageBucket: "reminder-app-fbdec.firebasestorage.app",
  messagingSenderId: "361431872463",
  appId: "1:361431872463:web:14cbd17c0e1e2288d258ba",
  measurementId: "G-XQDVQH2P77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// FCM token management
export const getFCMToken = async () => {
  if (!messaging) return null;
  
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });
    
    if (currentToken) {
      return currentToken;
    }
    
    console.log('No registration token available.');
    return null;
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Handle incoming messages when app is in foreground
export const onMessageListener = () => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    // You can handle the message here (e.g., show a notification)
    return payload;
  });
};

export default app; 