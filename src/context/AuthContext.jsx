import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'student' (user) or 'employer' (business owner)
  const [userProfile, setUserProfile] = useState(null);
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUserRole(data.user.role);
            setUserProfile(data.user);
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem('token');
          }
        } catch (e) {
          console.warn('Failed to validate token', e);
        }
      }
      setIsInitializingAuth(false);
    };

    initializeAuth();
  }, []);

  const login = (role, isNewUser, name, email, user = null) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setNeedsProfile(isNewUser);
    
    // Merge provided fields into userProfile
    const profileData = user || { role, name, email };
    setUserProfile(profileData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserRole(null);
    setUserProfile(null);
  };

  const updateProfile = async (data) => {
    const updatedProfile = { ...userProfile, ...data };
    setUserProfile(updatedProfile);
    setNeedsProfile(false);

    if (userProfile?.email) {
      try {
        await fetch(`${API_BASE_URL}/api/users/${userProfile.email}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.warn("Error updating profile in DB:", err);
      }
    }
  };

  const value = {
    isLoggedIn,
    userRole,
    userProfile,
    isInitializingAuth,
    needsProfile,
    setNeedsProfile,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
