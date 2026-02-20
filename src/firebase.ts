import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBsoGZtYhWFtaY5X6whBxrh4y1WyqMXaio",
  authDomain: "zenfinance-f8a21.firebaseapp.com",
  projectId: "zenfinance-f8a21",
  storageBucket: "zenfinance-f8a21.firebasestorage.app",
  messagingSenderId: "775051813889",
  appId: "1:775051813889:web:067cb5bad1c1e0508fcc00"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
