import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = ({ token: t, user: u } = {}) => {
    if (t) setToken(t);
    if (u) setUser(u);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const authHeader = () => ({ headers: { Authorization: token ? `Bearer ${token}` : '' } });

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
