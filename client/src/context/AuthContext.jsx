import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import http from '../api/http';

const TOKEN_KEY = 'lumen_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Starts true so protected routes don't flash/redirect before we've had a
  // chance to check for an existing token.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await http.get('/api/auth/me');
      setUser(res.data.user);
    } catch (err) {
      // Token missing/expired/invalid — clear it and fall back to logged out.
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (email, password) => {
    setError(null);
    const res = await http.post('/api/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (fullname, email, password, role) => {
    setError(null);
    const res = await http.post('/api/auth/register', { fullname, email, password, role });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const updateProfile = async (fields) => {
    const res = await http.put('/api/auth/profile', fields);
    setUser(res.data.user);
    return res.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile, refresh: loadCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
