import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const sid = localStorage.getItem('sid');
      if (!sid) {
        setLoading(false);
        return;
      }
      
      const response = await api.get('/auth/session', { 
        params: { sid } 
      });
      
      if (response.data.ok && response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, sid, password) => {
    try {
      const response = await api.post('/auth/login', { 
        email, sid, password 
      });
      
      if (response.data.ok) {
        localStorage.setItem('sid', response.data.sid);
        localStorage.setItem('token', response.data.token);
        setUser({
          sid: response.data.sid,
          email: response.data.email,
          role: response.data.role,
          isAdmin: response.data.isAdmin,
          credits: response.data.credits
        });
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('sid');
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (sid, email, password, photoData) => {
    try {
      const response = await api.post('/auth/register', {
        sid,
        email,
        password,
        photoData
      });
      return { success: response.data.ok, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
