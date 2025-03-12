//import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "AIzaSyA2QXLT2menxgzTaR8X2QpsDLRlA8qVJ_M",
  authDomain: "chat-fea87.firebaseapp.com",
  projectId: "chat-fea87",
  storageBucket: "chat-fea87.appspot.com",
  messagingSenderId: "198078642119",
  appId: "1:198078642119:web:0a2921ecd298042d880be2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()
