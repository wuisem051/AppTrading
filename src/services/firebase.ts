import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

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

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally (only in supported browser environments)
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};
