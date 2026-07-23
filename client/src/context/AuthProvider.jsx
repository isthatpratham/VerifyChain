import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { getMe, loginUser as apiLogin, registerUser as apiRegister } from '../services/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [msmeId, setMsmeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setMsmeId(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setMsmeId(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await getMe();
      setUser(userData);
      setMsmeId(userData.msmeId || null);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (credentials) => {
    const data = await apiLogin(credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setMsmeId(data.user?.msmeId || null);
    }
    return data;
  };

  const register = async (registrationData) => {
    const data = await apiRegister(registrationData);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setMsmeId(data.user?.msmeId || null);
    }
    return data;
  };

  const value = {
    user,
    token,
    msmeId,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
