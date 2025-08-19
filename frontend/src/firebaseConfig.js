import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For development purposes only - replace with your actual Firebase config when deploying
const firebaseConfig = {
  apiKey: "AIzaSyD-example-key-for-development",
  authDomain: "chalochalein-dev.firebaseapp.com",
  projectId: "chalochalein-dev",
  storageBucket: "chalochalein-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
  measurementId: "G-ABCDEFGHIJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const FIREBASE_AUTH = getAuth(app);

export { FIREBASE_AUTH };
