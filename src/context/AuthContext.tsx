"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from "firebase/firestore";

type Role = "admin" | "employee";

type Profile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: Role;
  approved: boolean;
  createdAt?: Timestamp | FieldValue;
};

type AuthState = {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginInProgress, setLoginInProgress] = useState(false);

  const ensureProfile = async (u: FirebaseUser) => {
    if (!u.email) return;

    const userRef = doc(db, "users", u.uid);
    const existing = await getDoc(userRef);

    if (existing.exists()) {
      setProfile(existing.data() as Profile);
      return;
    }

    const adminCheckRef = doc(collection(db, "admins"), u.email);
    const adminSnap = await getDoc(adminCheckRef);
    const isAdmin = adminSnap.exists();

    const newProfile: Omit<Profile, "createdAt"> & { createdAt: FieldValue } = {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName ?? u.email ?? null,
      photoURL: u.photoURL ?? null,
      role: isAdmin ? "admin" : "employee",
      approved: isAdmin ? true : false,
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, newProfile, { merge: true });

    const fresh = await getDoc(userRef);
    setProfile(fresh.data() as Profile);
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await ensureProfile(result.user);
        }
      } catch (err) {
        console.error("Error getting redirect result:", err);
      }
    };

    handleRedirectResult();

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await ensureProfile(u);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    if (loginInProgress) return; // 🚫 prevent multiple requests
    setLoginInProgress(true);

    try {
      if (process.env.NODE_ENV === "production") {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("User closed the login popup.");
      } else if (error.code === "auth/cancelled-popup-request") {
        console.log("Login already in progress, ignoring duplicate request.");
      } else {
        console.error("Google login error:", error);
      }
    } finally {
      setLoginInProgress(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
