import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBwP0WMRal1Gg7NSu7LdMwIaO5AU5a9S2c",
  authDomain: "mood-reflect-7ede9.firebaseapp.com",
  projectId: "mood-reflect-7ede9",
  storageBucket: "mood-reflect-7ede9.firebasestorage.app",
  messagingSenderId: "248662128236",
  appId: "1:248662128236:web:a0328f12772036b87bca49",
  measurementId: "G-0HFXQQNEBN",
  databaseURL: "https://mood-reflect-7ede9-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Realtime Database
const database = getDatabase(app);

// First, make sure your database rules are properly set
const databaseRules = {
  "rules": {
    "moods": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "posts": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": "timestamp"
    }
  }
}

export { auth, database };