
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const requiredEnvVars = [
  "REACT_APP_GOOGLE_API_KEY",
  "REACT_APP_AUTH_DOMAIN",
  "REACT_APP_PROJECT_ID",
  "REACT_APP_STORAGE_BUCKET",
  "REACT_APP_MESSAGING_SENDER_ID",
  "REACT_APP_APP_ID",
  "REACT_APP_DATABASE_URL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Firebase environment variable ${envVar} is missing.`);
  }
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
};

// Initialize Firebase
let app;
let auth;
let db;
let rtdb;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  rtdb = getDatabase(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { app, auth, db, rtdb, storage };
