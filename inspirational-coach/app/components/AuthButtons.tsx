"use client";

import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";

export default function AuthButtons() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      {user ? (
        <div>
          <p className="text-black">Welcome, {user.displayName}!</p>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={handleLogin} className="px-4 py-2 bg-blue-500 text-white rounded">
          Login with Google
        </button>
      )}
    </div>
  );
}
