import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('utsav_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to authenticate session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = (tokenData, userData) => {
    localStorage.setItem('utsav_token', tokenData);
    setToken(tokenData);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('utsav_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
