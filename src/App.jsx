import React, { useState, useEffect } from 'react';
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
import { API_BASE_URL } from './config';

function App() {
  const [showHome, setShowHome] = useState(true);
  const [authConfig, setAuthConfig] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'student' or 'employer'
  const [needsProfile, setNeedsProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userName, setUserName] = useState('Alex Johnson');
  const [userEmail, setUserEmail] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Dictionary state of applied jobs keyed by student email
  const [appliedJobsByEmail, setAppliedJobsByEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('flexigig_appliedJobs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('flexigig_applications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Get student-specific applied jobs list
  const appliedJobs = userEmail ? (appliedJobsByEmail[userEmail] || []) : [];

  // Update student-specific applied jobs list and persist to localStorage
  const handleSetAppliedJobs = (updater) => {
    if (!userEmail) return;
    setAppliedJobsByEmail(prev => {
      const currentApplied = prev[userEmail] || [];
      const nextApplied = typeof updater === 'function' ? updater(currentApplied) : updater;
      const updated = { ...prev, [userEmail]: nextApplied };
      localStorage.setItem('flexigig_appliedJobs', JSON.stringify(updated));
      return updated;
    });
  };

  // Persist applications to localStorage
  const handleSetApplications = (updater) => {
    setApplications(prev => {
      const nextApps = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('flexigig_applications', JSON.stringify(nextApps));
      return nextApps;
    });
  };

  const [globalJobs, setGlobalJobs] = useState([]);

  const [students, setStudents] = useState([
    { id: 1, name: 'Alex Johnson', college: 'Delhi University', major: 'B.Tech CS', appliedJobs: [2, 5], rating: 4.8, completedGigs: 12, earnings: '₹14,400', status: 'Active', avatar: 'AJ' },
    { id: 2, name: 'Priya Sharma', college: 'IIT Delhi', major: 'MBA', appliedJobs: [3], rating: 4.5, completedGigs: 8, earnings: '₹9,600', status: 'Active', avatar: 'PS' },
    { id: 3, name: 'Rahul Kumar', college: 'Jamia Millia', major: 'B.Com', appliedJobs: [6, 7], rating: 4.2, completedGigs: 5, earnings: '₹4,200', status: 'Inactive', avatar: 'RK' },
    { id: 4, name: 'Sneha Patel', college: 'NSIT', major: 'B.Tech ECE', appliedJobs: [4], rating: 4.9, completedGigs: 20, earnings: '₹32,000', status: 'Active', avatar: 'SP' },
  ]);

  const [employers, setEmployers] = useState([
    { id: 1, name: 'Local Coffee Shop', contact: 'Mr. Sharma', postedJobs: [2], rating: 4.6, totalHired: 8, status: 'Active', type: 'Food & Beverage' },
    { id: 2, name: 'City Gym', contact: 'Ms. Kapoor', postedJobs: [7], rating: 4.3, totalHired: 5, status: 'Active', type: 'Health & Fitness' },
    { id: 3, name: 'Local Marketing Agency', contact: 'Mr. Verma', postedJobs: [4], rating: 4.7, totalHired: 12, status: 'Active', type: 'Marketing' },
    { id: 4, name: "Joe's Pizzeria", contact: 'Joe', postedJobs: [6], rating: 3.9, totalHired: 3, status: 'Flagged', type: 'Food & Beverage' },
  ]);

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const jobsRes = await fetch(`${API_BASE_URL}/api/jobs`);
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          if (jobsData) {
            setGlobalJobs(jobsData);
          }
        }
        const appsRes = await fetch(`${API_BASE_URL}/api/applications`);
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (appsData) {
            setApplications(appsData);
          }
        }
      } catch (err) {
        console.error("Backend not running or DB empty, using default frontend data.");
      }
    };
    fetchBackendData();
  }, []);

  const handleLogin = (role, isNewUser, name, email) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setNeedsProfile(isNewUser);
    if (name) setUserName(name);
    if (email) setUserEmail(email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserEmail('');
  };

  const handleProfileComplete = (data) => {
    setUserProfile(data);
    setNeedsProfile(false);
    
    if (userRole === 'student') {
      setStudents(prev => [...prev, {
        id: Date.now(), 
        name: userName, 
        college: data.major || 'University', 
        major: data.major || 'Undeclared', 
        appliedJobs: [], 
        rating: 5.0, 
        completedGigs: 0, 
        earnings: '₹0', 
        status: 'Active', 
        avatar: userName.substring(0,2).toUpperCase()
      }]);
    } else if (userRole === 'employer') {
      setEmployers(prev => [...prev, {
        id: Date.now(), 
        name: data.businessType || 'Business', 
        contact: userName, 
        postedJobs: [], 
        rating: 5.0, 
        totalHired: 0, 
        status: 'Active', 
        type: data.businessType || 'Local Business'
      }]);
    }
  };

  const goHome = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setShowHome(true);
    setCurrentView('dashboard');
  };

  const renderStudentView = () => {
    const studentJobs = globalJobs.filter(j => j.status !== 'Inactive');
    switch (currentView) {
      case 'dashboard':
        return <Dashboard key="dashboard" onNavigate={setCurrentView} appliedJobs={appliedJobs} userProfile={{ name: userName, email: userEmail, ...userProfile }} globalJobs={studentJobs} />;
      case 'jobs':
        return <Jobs key="jobs" userProfile={{ name: userName, email: userEmail, ...userProfile }} appliedJobs={appliedJobs} setAppliedJobs={handleSetAppliedJobs} globalJobs={studentJobs} applications={applications} setApplications={handleSetApplications} />;
      case 'profile':
        return <Profile key="profile" userData={{ name: userName, email: userEmail, ...userProfile }} onUpdateProfile={(data) => setUserProfile(prev => ({ ...prev, ...data }))} />;
      default:
        return <Dashboard key="dashboard" onNavigate={setCurrentView} appliedJobs={appliedJobs} userProfile={{ name: userName, email: userEmail, ...userProfile }} globalJobs={studentJobs} />;
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait">
        {showHome ? (
          <Home key="home" onGoToLogin={(role = null, isLogin = true) => {
            setAuthConfig({ role, isLogin });
            setShowHome(false);
          }} />
        ) : !isLoggedIn ? (
          <Auth key="auth" onLogin={handleLogin} goHome={goHome} initialConfig={authConfig} />
        ) : needsProfile ? (
          <motion.div key="create-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CreateProfile role={userRole} onComplete={handleProfileComplete} goHome={goHome} />
          </motion.div>
        ) : userRole === 'admin' ? (
          <motion.div key="admin-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AdminDashboard globalJobs={globalJobs} setGlobalJobs={setGlobalJobs} students={students} setStudents={setStudents} employers={employers} setEmployers={setEmployers} goHome={goHome} />
          </motion.div>
        ) : userRole === 'employer' ? (
          <motion.div key="employer-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <EmployerDashboard onLogout={handleLogout} appliedJobs={appliedJobs} applications={applications} userProfile={{ name: userName, email: userEmail, ...userProfile }} globalJobs={globalJobs} setGlobalJobs={setGlobalJobs} goHome={goHome} />
          </motion.div>
        ) : (
          <motion.div key="student-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Navbar currentView={currentView} setCurrentView={setCurrentView} userProfile={{ name: userName, email: userEmail, ...userProfile }} goHome={goHome} />
            <main style={{ flex: 1, padding: '1rem 2rem 4rem 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderStudentView()}
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
