import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('flexigig_is_logged_in') === 'true';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('flexigig_user_role') || null;
  });
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('flexigig_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
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
            localStorage.setItem('flexigig_user_profile', JSON.stringify(data.user));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('flexigig_user_profile');
          }
        } catch (e) {
          console.warn('Failed to validate token with server, using local fallback:', e);
          const savedProfile = localStorage.getItem('flexigig_user_profile');
          if (savedProfile) {
            try {
              const user = JSON.parse(savedProfile);
              setUserRole(user.role);
              setUserProfile(user);
              setIsLoggedIn(true);
            } catch (_) {}
          } else {
            const decoded = decodeToken(token);
            if (decoded) {
              const user = { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.email.split('@')[0] };
              setUserRole(user.role);
              setUserProfile(user);
              setIsLoggedIn(true);
            }
          }
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
    localStorage.setItem('flexigig_is_logged_in', 'true');
    localStorage.setItem('flexigig_user_role', role);
    localStorage.setItem('flexigig_user_profile', JSON.stringify(profileData));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('flexigig_is_logged_in');
    localStorage.removeItem('flexigig_user_role');
    localStorage.removeItem('flexigig_user_profile');
    setIsLoggedIn(false);
    setUserRole(null);
    setUserProfile(null);
  };

  const updateProfile = async (data) => {
    const updatedProfile = { ...userProfile, ...data };
    setUserProfile(updatedProfile);
    setNeedsProfile(false);
    localStorage.setItem('flexigig_user_profile', JSON.stringify(updatedProfile));

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
