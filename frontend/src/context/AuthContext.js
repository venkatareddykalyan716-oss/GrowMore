import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(sessionStorage.getItem('gm_token'));

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedToken = sessionStorage.getItem('gm_token');
    if (storedToken) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.user);
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (phone, password) => {
    try {
      const response = await authAPI.login({ phone, password });
      const { token: newToken, user: userData } = response.data;
      
      sessionStorage.setItem('gm_token', newToken);
      sessionStorage.setItem('gm_user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await authAPI.register(formData);
      const { token: newToken, user: userData } = response.data;
      
      sessionStorage.setItem('gm_token', newToken);
      sessionStorage.setItem('gm_user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('gm_token');
    sessionStorage.removeItem('gm_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
