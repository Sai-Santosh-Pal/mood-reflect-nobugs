import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBhrSR1YWwvdWiKtp2CovqBshmfoOCcaHE",
  authDomain: "mood-reflect.firebaseapp.com",
  projectId: "mood-reflect",
  storageBucket: "mood-reflect.firebasestorage.app",
  messagingSenderId: "72618733137",
  appId: "1:72618733137:web:4bb6f6668b5fc875625270",
  measurementId: "G-Q1M3PX27HE",
  databaseURL: "https://mood-reflect-default-rtdb.firebaseio.com"
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
        // Allow read/write only if the user is authenticated and it's their own data
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "users": {
      "$uid": {
        // Allow read/write only if the user is authenticated and it's their own data
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}

export { auth, database };