// firebase-config.js — BistroCuza16 Game

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyATCm9aVbzyGJVPma6CdtJ7OPyczjdBQK4",
  authDomain:        "cuza16-game.firebaseapp.com",
  projectId:         "cuza16-game",
  storageBucket:     "cuza16-game.firebasestorage.app",
  messagingSenderId: "92586140613",
  appId:             "1:92586140613:web:3326e50ba9dfcc923f61ac",
  measurementId:     "G-R8DWGBC200"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export {
  auth, db,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  doc, getDoc, setDoc, updateDoc,
  increment, serverTimestamp,
  collection, query, orderBy, limit, getDocs,
  runTransaction
};
