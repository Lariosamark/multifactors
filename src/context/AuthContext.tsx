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
} from "firebase/firestore";

type Role = "admin" | "employee";
type Profile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  approved: boolean; // employees require approval
  createdAt?: any;
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

  // Create/merge Firestore profile on first login
  const ensureProfile = async (u: FirebaseUser) => {
    if (!u.email) return;

    const userRef = doc(db, "users", u.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      setProfile(snap.data() as Profile);
      return;
    }

    // Pre-approved admins collection: /admins/<email>
    const adminCheckRef = doc(collection(db, "admins"), u.email);
    const adminSnap = await getDoc(adminCheckRef);
    const isAdmin = adminSnap.exists();

    const newProfile: Profile = {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName || u.email,
      photoURL: u.photoURL || undefined,
      role: isAdmin ? "admin" : "employee",
      approved: isAdmin ? true : false, // employees start unapproved
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, newProfile, { merge: true });
    setProfile(newProfile);
  };

  useEffect(() => {
    // Handle redirect login result
    const handleRedirectResult = async () => {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        await ensureProfile(result.user);
      }
    };

    handleRedirectResult();

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await ensureProfile(u);
      else setProfile(null);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    if (process.env.NODE_ENV === "production") {
      // Use redirect for production to avoid popup closing issues
      await signInWithRedirect(auth, googleProvider);
    } else {
      // Use popup for dev convenience
      await signInWithPopup(auth, googleProvider);
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
