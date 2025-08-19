import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebaseConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock user data for development
  const mockUser = {
    uid: 'mock-user-id',
    email: 'user@example.com',
    displayName: 'Test User',
    photoURL: 'https://via.placeholder.com/150',
    role: 'user'
  };

  function login(email, password) {
    return signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
  }

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(FIREBASE_AUTH, provider);
  }

  function logout() {
    return signOut(FIREBASE_AUTH);
  }

  useEffect(() => {
    // For development - use mock user data
    setCurrentUser(mockUser);
    setLoading(false);

    // Comment out for development
    /* 
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setCurrentUser(user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        role: 'user' // You can fetch this from your database
      } : null);
      setLoading(false);
    });

    return unsubscribe;
    */
  }, []);

  const value = {
    currentUser,
    login,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 