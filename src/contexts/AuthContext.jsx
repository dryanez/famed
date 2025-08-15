import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataManager } from '../lib/dataManager.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('famedUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // Also set in dataManager for API consistency
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simple login simulation - replace with your backend
    if (email && password) {
      const userData = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        accountType: 'premium', // Default to premium for now
        createdAt: new Date().toISOString(),
        xp: 0,
        level: 1,
        title: 'Anfänger'
      };
      
      setUser(userData);
      localStorage.setItem('famedUser', JSON.stringify(userData));
      // Also store for dataManager API compatibility
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const signup = async (email, password, name) => {
    // Simple signup simulation - replace with your backend
    if (email && password && name) {
      const userData = {
        id: Date.now().toString(),
        email,
        name,
        accountType: 'premium',
        createdAt: new Date().toISOString(),
        xp: 0,
        level: 1,
        title: 'Anfänger'
      };
      
      setUser(userData);
      localStorage.setItem('famedUser', JSON.stringify(userData));
      // Also store for dataManager API compatibility
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, error: 'All fields are required' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('famedUser');
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
