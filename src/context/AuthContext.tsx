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
  onSnapshot,
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
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create or merge Firestore profile on first login
  const ensureProfile = async (u: FirebaseUser) => {
    if (!u.email) return;

    const userRef = doc(db, "users", u.uid);
    const existing = await getDoc(userRef);

    if (existing.exists()) {
      const data = existing.data();
      if (data) {
        setProfile({
          uid: data.uid ?? u.uid,
          email: data.email ?? u.email,
          displayName: data.displayName ?? u.displayName ?? null,
          photoURL: data.photoURL ?? null,
          role: (data.role as Role) ?? "employee",
          approved: data.approved ?? false,
          createdAt: data.createdAt ?? serverTimestamp(),
        });
      }
      return;
    }

    const adminCheckRef = doc(collection(db, "admins"), u.email);
    const adminSnap = await getDoc(adminCheckRef);
    const isAdmin = adminSnap.exists();

    const newProfile: Profile & { createdAt: FieldValue } = {
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
    if (fresh.exists()) {
      const data = fresh.data();
      setProfile({
        uid: data.uid ?? u.uid,
        email: data.email ?? u.email,
        displayName: data.displayName ?? u.displayName ?? null,
        photoURL: data.photoURL ?? null,
        role: (data.role as Role) ?? "employee",
        approved: data.approved ?? false,
        createdAt: data.createdAt ?? serverTimestamp(),
      });
    }
  };

  // Refresh profile manually
  const refreshProfile = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data) {
        setProfile({
          uid: data.uid ?? user.uid,
          email: data.email ?? user.email,
          displayName: data.displayName ?? user.displayName ?? null,
          photoURL: data.photoURL ?? null,
          role: (data.role as Role) ?? "employee",
          approved: data.approved ?? false,
          createdAt: data.createdAt ?? serverTimestamp(),
        });
      }
    }
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await ensureProfile(result.user);
        }
      } catch {
        // ignore
      }
    };
    handleRedirectResult();

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await ensureProfile(u);

        // Real-time listener for profile updates
        const userRef = doc(db, "users", u.uid);
        const unsubSnapshot = onSnapshot(userRef, (snapshot) => {
          const data = snapshot.data();
          if (data) {
            setProfile({
              uid: data.uid ?? u.uid,
              email: data.email ?? u.email,
              displayName: data.displayName ?? u.displayName ?? null,
              photoURL: data.photoURL ?? null,
              role: (data.role as Role) ?? "employee",
              approved: data.approved ?? false,
              createdAt: data.createdAt ?? serverTimestamp(),
            });
          }
        });

        // Stop snapshot listener on logout
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
