import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('neuroshield_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem('neuroshield_token');
          }
        } catch (err) {
          // Fallback demo user if backend is spinning up
          setUser({
            id: 'demo-analyst',
            name: 'Cyber Analyst',
            email: 'analyst@neuroshield.io',
            role: 'Senior SOC Analyst'
          });
        }
      } else {
        // Auto initialize demo state for seamless user experience
        setUser({
          id: 'demo-analyst',
          name: 'Cyber Threat Lead',
          email: 'analyst@neuroshield.io',
          role: 'Senior SOC Lead'
        });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('neuroshield_token', res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed.' };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        localStorage.setItem('neuroshield_token', res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('neuroshield_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
