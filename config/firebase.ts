import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth }; 