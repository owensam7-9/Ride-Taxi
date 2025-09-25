import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from 'firebase/firestore';
import { 
  getDatabase,
  ref,
  onValue
} from 'firebase/database';
import { getStorage } from 'firebase/storage';

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
let storage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Firestore with enhanced persistence configuration
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      tabManager: persistentSingleTabManager({ forceOwnership: true })
    })
  });

  // Firestore persistence is configured via initializeFirestore with
  // persistentLocalCache + persistentSingleTabManager above. Avoid calling
  // `enableIndexedDbPersistence` here because it will throw if the SDK cache
  // is already specified (e.g. when using persistentLocalCache).
  
  // Initialize Realtime Database
  rtdb = getDatabase(app);
  
  // Initialize Storage
  storage = getStorage(app);
  
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

export { app, auth, db, rtdb, storage };
