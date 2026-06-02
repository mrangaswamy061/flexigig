import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Jobs from './components/Jobs';
import Profile from './components/Profile';
import Auth from './components/Auth';
import EmployerDashboard from './components/EmployerDashboard';
import CreateProfile from './components/CreateProfile';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useJobs } from './context/JobContext';

function App() {
  const { isLoggedIn, userRole, isInitializingAuth, needsProfile, userProfile, updateProfile } = useAuth();
  
  if (isInitializingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        <div className="lucide-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  // If the user has just registered and needs to complete their profile
  if (needsProfile && isLoggedIn) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <motion.div key="create-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CreateProfile role={userRole} onComplete={updateProfile} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isLoggedIn && <Navbar />}
      
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!isLoggedIn ? <Home /> : <Navigate to={userRole === 'employer' ? "/business/dashboard" : userRole === 'admin' ? "/admin/dashboard" : "/user/dashboard"} />} />
          <Route path="/login" element={!isLoggedIn ? <Auth /> : <Navigate to={userRole === 'employer' ? "/business/dashboard" : userRole === 'admin' ? "/admin/dashboard" : "/user/dashboard"} />} />

          {/* User Protected Routes */}
          <Route path="/user/dashboard" element={isLoggedIn && userRole === 'student' ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/user/jobs" element={isLoggedIn && userRole === 'student' ? <Jobs /> : <Navigate to="/" />} />
          <Route path="/user/profile" element={isLoggedIn && userRole === 'student' ? <Profile /> : <Navigate to="/" />} />

          {/* Business Owner Protected Routes */}
          <Route path="/business/dashboard" element={isLoggedIn && userRole === 'employer' ? <EmployerDashboard /> : <Navigate to="/" />} />
          <Route path="/business/profile" element={isLoggedIn && userRole === 'employer' ? <Profile /> : <Navigate to="/" />} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={isLoggedIn && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
