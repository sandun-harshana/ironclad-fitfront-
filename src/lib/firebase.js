// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBbHXHEByegGZlhTJvP8BLVwhGz9SiJbDw",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gym-management-system-amanda.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gym-management-system-amanda",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gym-management-system-amanda.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "296874566250",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:296874566250:web:70668d27cb80ffefb6e013"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;