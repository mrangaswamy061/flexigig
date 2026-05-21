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
  const [currentView, setCurrentView] = useState('dashboard');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [globalJobs, setGlobalJobs] = useState([
    { id: 1, title: 'Research Assistant', dept: 'Psychology Dept', type: 'On Campus', employerType: 'Campus', distance: 0.5, location: 'Main Campus', pay: '₹400/hr', duration: '10 hrs/wk', tags: ['Research', 'Data'], skillLevel: 'Skilled', latlng: [28.6139, 77.2090], coordinates: { x: 55, y: 45 } },
    { id: 2, title: 'Barista (Part-time)', dept: 'Local Coffee Shop', type: 'In Person', employerType: 'Local Business', distance: 1.2, location: 'Downtown Avenue', pay: '₹250/hr', duration: '15 hrs/wk', tags: ['Customer Service'], skillLevel: 'Unskilled', latlng: [28.6189, 77.2190], coordinates: { x: 40, y: 60 } },
    { id: 3, title: 'Dog Walker', dept: 'Neighborhood Pet Care', type: 'In Person', employerType: 'Local Business', distance: 2.5, location: 'West End', pay: '₹300/hr', duration: 'Flexible', tags: ['Pets', 'Outdoors'], skillLevel: 'Unskilled', latlng: [28.6089, 77.1990], coordinates: { x: 20, y: 30 } },
    { id: 4, title: 'Graphic Designer', dept: 'Local Marketing Agency', type: 'Hybrid', employerType: 'Local Business', distance: 3.5, location: 'Tech Park', pay: '₹800/hr', duration: 'Flexible', tags: ['Design'], skillLevel: 'Skilled', latlng: [28.6239, 77.2000], coordinates: { x: 80, y: 80 } },
    { id: 5, title: 'Event Setup Assistant', dept: 'City Community Center', type: 'In Person', employerType: 'Local Business', distance: 1.8, location: 'City Hall', pay: '₹350/hr', duration: 'Weekends', tags: ['Physical', 'Events'], skillLevel: 'Unskilled', latlng: [28.6100, 77.2200], coordinates: { x: 60, y: 20 } },
    { id: 6, title: 'Flyer Distributor', dept: 'Joe\'s Pizzeria', type: 'In Person', employerType: 'Local Business', distance: 4.0, location: 'Campus Area', pay: '₹200/hr', duration: '4 hrs/wk', tags: ['Marketing', 'Walking'], skillLevel: 'Unskilled', latlng: [28.6200, 77.1900], coordinates: { x: 10, y: 90 } },
    { id: 7, title: 'Fitness Instructor', dept: 'City Gym', type: 'In Person', employerType: 'Local Business', distance: 2.1, location: 'Main Street', pay: '₹600/hr', duration: 'Early Mornings', tags: ['Fitness'], skillLevel: 'Skilled', latlng: [28.6050, 77.2150], coordinates: { x: 70, y: 40 } },
    { id: 8, title: 'Lawn Care & Raking', dept: 'Private Residence', type: 'In Person', employerType: 'Local Business', distance: 3.0, location: 'Suburbs', pay: '₹300/hr', duration: 'One-time', tags: ['Physical', 'Outdoors'], skillLevel: 'Unskilled', latlng: [28.6250, 77.2250], coordinates: { x: 30, y: 80 } }
  ]);

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
          if (jobsData && jobsData.length > 0) {
            setGlobalJobs(jobsData);
          }
        }
        const appsRes = await fetch(`${API_BASE_URL}/api/applications`);
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (appsData && appsData.length > 0) {
            setApplications(appsData);
          }
        }
      } catch (err) {
        console.error("Backend not running or DB empty, using default frontend data.");
      }
    };
    fetchBackendData();
  }, []);

  const handleLogin = (role, isNewUser, name) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setNeedsProfile(isNewUser);
    if (name) setUserName(name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
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
    const studentJobs = globalJobs.filter(j => j.employerType === 'Local Business' || j.postedByEmployer);
    switch (currentView) {
      case 'dashboard':
        return <Dashboard key="dashboard" onNavigate={setCurrentView} appliedJobs={appliedJobs} userProfile={{ name: userName, ...userProfile }} globalJobs={studentJobs} />;
      case 'jobs':
        return <Jobs key="jobs" userProfile={{ name: userName, ...userProfile }} appliedJobs={appliedJobs} setAppliedJobs={setAppliedJobs} globalJobs={studentJobs} applications={applications} setApplications={setApplications} />;
      case 'profile':
        return <Profile key="profile" userData={{ name: userName, ...userProfile }} onUpdateProfile={(data) => setUserProfile(prev => ({ ...prev, ...data }))} />;
      default:
        return <Dashboard key="dashboard" onNavigate={setCurrentView} appliedJobs={appliedJobs} userProfile={{ name: userName, ...userProfile }} globalJobs={studentJobs} />;
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
            <EmployerDashboard onLogout={handleLogout} appliedJobs={appliedJobs} applications={applications} userProfile={{ name: userName, ...userProfile }} globalJobs={globalJobs} setGlobalJobs={setGlobalJobs} goHome={goHome} />
          </motion.div>
        ) : (
          <motion.div key="student-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Navbar currentView={currentView} setCurrentView={setCurrentView} userProfile={{ name: userName, ...userProfile }} goHome={goHome} />
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
