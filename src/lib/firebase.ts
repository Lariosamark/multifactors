// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3sx1FyBNfJ5c_zPhPtCRhLcjiU-FCHK8",
  authDomain: "multifactors-sales.vercel.app", // ✅ Use your Vercel domain
  projectId: "qmss-91e0f",
  storageBucket: "qmss-91e0f.appspot.com",     // ✅ fixed typo here
  messagingSenderId: "74979323846",
  appId: "1:74979323846:web:35eff0add880efc5970cc7",
  measurementId: "G-X6N0STXSP2",
};

// Prevent duplicate apps during Next.js hot reload
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();
