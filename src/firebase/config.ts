import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

if (!process.env.REACT_APP_GOOGLE_API_KEY) {
  console.error('Firebase API key is missing in environment variables');
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: "ride-cosy.firebaseapp.com",
  projectId: "ride-cosy",
  storageBucket: "ride-cosy.firebasestorage.app",
  messagingSenderId: "630922593814",
  appId: "1:630922593814:web:75f9c6a27b573b77069737",
  databaseURL: "https://ride-cosy-default-rtdb.firebaseio.com" // Add this for Realtime Database
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
  console.error('Error initializing Firebase:', error);
}

export { app, auth, db, rtdb, storage };