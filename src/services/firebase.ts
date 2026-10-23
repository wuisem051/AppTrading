import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBElqiHuMCpJ-1uOGpxnkZRmEZjqMIIl9w",
  authDomain: "tradingapp-b311e.firebaseapp.com",
  projectId: "tradingapp-b311e",
  storageBucket: "tradingapp-b311e.firebasestorage.app",
  messagingSenderId: "1061865255303",
  appId: "1:1061865255303:web:208c4ac04df8bba672e322",
  measurementId: "G-Q3LBE2ZJB5"
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
