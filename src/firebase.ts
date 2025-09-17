import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

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
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  rtdb = getDatabase(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { app, auth, db, rtdb };
