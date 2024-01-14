// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';  // Import for Firebase Storage

const firebaseConfig = {
    apiKey: "AIzaSyA74AIPNWlkChaKnzl8IqNrQwh4PgOPjT4",
    authDomain: "priv-notes-381de.firebaseapp.com",
    projectId: "priv-notes-381de",
    storageBucket: "priv-notes-381de.appspot.com",
    messagingSenderId: "186997745558",
    appId: "1:186997745558:web:e6a0586369d7716c175fb7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export { db, storage };
