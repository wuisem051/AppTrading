import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

<<<<<<< HEAD
// Environment variables configuration (keeps credentials safe from git push)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
=======
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBElqiHuMCpJ-1uOGpxnkZRmEZjqMIIl9w",
  authDomain: "tradingapp-b311e.firebaseapp.com",
  projectId: "tradingapp-b311e",
  storageBucket: "tradingapp-b311e.firebasestorage.app",
  messagingSenderId: "1061865255303",
  appId: "1:1061865255303:web:208c4ac04df8bba672e322",
  measurementId: "G-Q3LBE2ZJB5"
>>>>>>> 21fcd99d93a8d991e9046e84f1f09ac36370397f
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
