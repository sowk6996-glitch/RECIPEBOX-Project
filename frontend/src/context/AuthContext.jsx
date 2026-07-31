import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        try {
          const { data } = await api.get('/api/auth/profile');
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
          console.error('Failed to restore user session:', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    setToken(data.token);
    setUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/api/auth/register', formData);
    setToken(data.token);
    setUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const updateProfile = async (formData) => {
    const { data } = await api.put('/api/auth/profile', formData);
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Check if current user is following targetUserId
  const isFollowing = (targetUserId) => {
    if (!user || !user.following) return false;
    return user.following.some(f => {
      const id = typeof f === 'object' ? f._id : f;
      return id === targetUserId;
    });
  };

  // Instantly toggle follow state in local auth context for fast UI update
  const toggleFollowInContext = (targetUserId, followStatus) => {
    if (!user) return;
    
    let updatedFollowing = [...(user.following || [])];
    if (followStatus) {
      // follow: add if not exists
      if (!updatedFollowing.some(f => (typeof f === 'object' ? f._id : f) === targetUserId)) {
        updatedFollowing.push(targetUserId);
      }
    } else {
      // unfollow: remove
      updatedFollowing = updatedFollowing.filter(f => (typeof f === 'object' ? f._id : f) !== targetUserId);
    }

    const updatedUser = { ...user, following: updatedFollowing };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile, 
      isFollowing, 
      toggleFollowInContext, 
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
