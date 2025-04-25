"use client";

import { useState } from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useUser } from "../context/UserContext";

export default function AuthButtons() {
  const { user, loading } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async () => {
    setIsProcessing(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if this is a new user or returning user
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create a new user document if this is a first-time user
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        // Update the lastLogin field for returning users
        await setDoc(userDocRef, {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    setIsProcessing(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {user ? (
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt={user.displayName || "User"} 
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <p className="text-sm text-black">Welcome, {user.displayName || user.email}!</p>
            <button 
              onClick={handleLogout}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition disabled:opacity-70"
            >
              {isProcessing ? "Processing..." : "Logout"}
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-70"
        >
          {isProcessing ? "Processing..." : "Login with Google"}
        </button>
      )}
    </div>
  );
}