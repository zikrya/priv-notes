// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use

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
const db = getFirestore(app);

export { db };