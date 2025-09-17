import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, connectDatabaseEmulator, ref, set, onValue, onDisconnect } from 'firebase/database';
import { enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

// Check for required environment variables
const requiredEnvVars = {
  REACT_APP_GOOGLE_API_KEY: process.env.REACT_APP_GOOGLE_API_KEY,
  REACT_APP_AUTH_DOMAIN: process.env.REACT_APP_AUTH_DOMAIN,
  REACT_APP_PROJECT_ID: process.env.REACT_APP_PROJECT_ID,
  REACT_APP_STORAGE_BUCKET: process.env.REACT_APP_STORAGE_BUCKET,
  REACT_APP_MESSAGING_SENDER_ID: process.env.REACT_APP_MESSAGING_SENDER_ID,
  REACT_APP_APP_ID: process.env.REACT_APP_APP_ID,
  REACT_APP_DATABASE_URL: process.env.REACT_APP_DATABASE_URL
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  throw new Error('Missing required environment variables. Check .env file.');
}

const firebaseConfig = {
  apiKey: requiredEnvVars.REACT_APP_GOOGLE_API_KEY,
  authDomain: requiredEnvVars.REACT_APP_AUTH_DOMAIN,
  projectId: requiredEnvVars.REACT_APP_PROJECT_ID,
  storageBucket: requiredEnvVars.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: requiredEnvVars.REACT_APP_MESSAGING_SENDER_ID,
  appId: requiredEnvVars.REACT_APP_APP_ID,
  databaseURL: requiredEnvVars.REACT_APP_DATABASE_URL
};

// Initialize Firebase services with better error handling
let app;
let auth;
let db;
let rtdb;


try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Firestore with persistence
  db = getFirestore(app);
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Multiple tabs open, persistence disabled');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Browser does not support persistence');
    }
  });
  
  // Initialize Realtime Database
  rtdb = getDatabase(app);
  
  // Setup database connection monitoring
  const connectedRef = ref(rtdb, '.info/connected');
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      console.log('Connected to Firebase Realtime Database');
    } else {
      console.warn('Not connected to Firebase Realtime Database');
    }
  });
  
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error; // Re-throw to handle it in the UI
}

export { app, auth, db, rtdb };
