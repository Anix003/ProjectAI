'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {}
});

const fetchSessionData = async () => {
  try {
    const res = await fetch('/api/auth/session');
    if (res.ok) {
      const data = await res.json();
      return data.user || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const initSession = async () => {
      const userData = await fetchSessionData();
      if (active) {
        setUser(userData);
        setIsLoading(false);
      }
    };
    initSession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const userData = await fetchSessionData();
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await fetchSessionData();
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
