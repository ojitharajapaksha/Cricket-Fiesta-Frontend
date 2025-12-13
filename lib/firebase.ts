import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgXFwoOzXsgXTPVpQ4KxU9xJt_J4sDP_k",
  authDomain: "cricket-fiesta.firebaseapp.com",
  projectId: "cricket-fiesta",
  storageBucket: "cricket-fiesta.firebasestorage.app",
  messagingSenderId: "800453472616",
  appId: "1:800453472616:web:874ead7744c290b35ae6dd",
  measurementId: "G-QNMXK28CHC"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const storage = getStorage(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account' // Force account selection
});

export { googleProvider, signInWithPopup, signOut };

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
