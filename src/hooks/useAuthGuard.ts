"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Guards page access based on role and approval.
 * - "admin": must be admin.
 * - "employeeApproved": must be employee AND approved.
 */
export function useAuthGuard(requirement: "admin" | "employeeApproved") {
  const { user, profile: initialProfile, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    if (loading) return; // wait for auth state

    // Not logged in → go to /login
    if (!user) {
      router.replace("/login");
      return;
    }

    // No profile loaded yet
    if (!profile) return;

    // Admin guard
    if (requirement === "admin" && profile.role !== "admin") {
      router.replace("/");
      return;
    }

    // Employee with approval guard
    if (requirement === "employeeApproved") {
      if (profile.role !== "employee") {
        router.replace("/");
        return;
      }

      if (!profile.uid) return;

      // Listen to real-time updates for the user's document
      const userDocRef = doc(db, "users", profile.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        const data = docSnap.data();

        if (!data?.approved) {
          // Not approved → pending
          router.replace("/login?status=pending");
        } else {
          // Approved → employee dashboard
          router.replace("/employee/dashboard");
        }

        // Update local profile for reactivity
        setProfile({ ...profile, ...data });
      });

      return () => unsubscribe();
    }
  }, [user, profile, loading, router, requirement]);

  return { user, profile, loading };
}
