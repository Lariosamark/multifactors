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
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

type Role = "admin" | "employee";

export type Profile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: Role;
  approved: boolean;
  createdAt?: any;
};

type AuthState = {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (u: FirebaseUser) => {
    if (!u.email) return;

    const userRef = doc(db, "users", u.uid);
    const existing = await getDoc(userRef);

    if (existing.exists()) {
      setProfile(existing.data() as Profile);
      return;
    }

    // Check if user is admin
    const adminCheckRef = doc(db, "admins", u.email);
    const adminSnap = await getDoc(adminCheckRef);
    const isAdmin = adminSnap.exists();

    const newProfile: Profile = {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName ?? u.email,
      photoURL: u.photoURL ?? null,
      role: isAdmin ? "admin" : "employee",
      approved: isAdmin ? true : false,
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, newProfile, { merge: true });
    setProfile(newProfile);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) setProfile(docSnap.data() as Profile);
  };

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) await ensureProfile(result.user);
      } catch {
        // ignore errors
      }
    };
    handleRedirect();

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await ensureProfile(u);

        // Real-time profile updates
        const userRef = doc(db, "users", u.uid);
        const unsubSnapshot = onSnapshot(userRef, (snapshot) => {
          const data = snapshot.data();
          if (data) setProfile(data as Profile);
        });

        return () => unsubSnapshot();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const loginWithGoogle = async () => {
    if (process.env.NODE_ENV === "production") {
      await signInWithRedirect(auth, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
