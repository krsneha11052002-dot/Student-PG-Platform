import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('staysmart_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Auth fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('staysmart_token', data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server connection error' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('staysmart_token', data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Registration error' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('staysmart_token');
  };

  // 1-Click Quick Login for instant demo testing across roles!
  const loginAsDemo = async (role) => {
    if (role === 'guest') {
      logout();
      return { success: true };
    }

    const credentials = {
      student: { email: 'student@staysmart.com', password: 'student123' },
      owner: { email: 'owner@staysmart.com', password: 'owner123' },
      admin: { email: 'admin@staysmart.com', password: 'admin123' }
    };

    const cred = credentials[role];
    if (cred) {
      return await login(cred.email, cred.password);
    }
    return { success: false, message: 'Unknown role demo' };
  };

  const toggleSavePG = async (pgId) => {
    if (!token || !user) return;
    try {
      const res = await fetch(`/api/auth/save-pg/${pgId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(prev => ({ ...prev, savedPGs: data.savedPGs }));
      }
    } catch (err) {
      console.error('Toggle save PG error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, loginAsDemo, toggleSavePG }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
