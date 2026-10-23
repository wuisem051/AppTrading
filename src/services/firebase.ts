import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Environment variables configuration with secure fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBElqiHuMCpJ-1uOGpxnkZRmEZjqMIIl9w",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tradingapp-b311e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tradingapp-b311e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tradingapp-b311e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1061865255303",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1061865255303:web:208c4ac04df8bba672e322",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Q3LBE2ZJB5"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Analytics conditionally (safe for browser & PWA/mobile environments)
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};
