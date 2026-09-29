import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Environment variable configuration with reliable fallback defaults
// For Hostinger or local development, just create a .env file with VITE_ prefixed keys
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD_-8xhxNo-mqFd2Tr_Q9aVXq8dBO-lXVk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nasirdigitalhub-d859f.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://nasirdigitalhub-d859f-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nasirdigitalhub-d859f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nasirdigitalhub-d859f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "267333167686",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:267333167686:web:f2703be6ff28b3b12e3847",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WQRMCFHWQD"
};

// Admin UID - Can also be overridden in .env if needed
export const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || "gFWFL8xck2XCvXo1UZ9MaVjnzqK2";

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Connection test as mandated by Firebase skill
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'store'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or network is disconnected.");
    }
    return false;
  }
}
