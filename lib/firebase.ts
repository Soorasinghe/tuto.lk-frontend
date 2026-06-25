// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA066h2NCLQ3Y8izJPWKthUGaKufW8JrUc",
  authDomain: "tuto-lk.firebaseapp.com",
  projectId: "tuto-lk",
  storageBucket: "tuto-lk.firebasestorage.app",
  messagingSenderId: "587274562290",
  appId: "1:587274562290:web:d4eaf398796a8d59ff3e6b",
  measurementId: "G-49NBEYSWKT"
};

// Initialize Firebase for the frontend
const app = initializeApp(firebaseConfig);

// Export the Storage service so our dashboard can use it
export const storage = getStorage(app);
export const auth = getAuth(app);