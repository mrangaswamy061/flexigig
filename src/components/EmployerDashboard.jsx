import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, IndianRupee, Clock, MapPin, X, Navigation, Building2, User, Globe, Mail } from 'lucide-react';
import RealMap from './RealMap';
import { API_BASE_URL } from '../config';

const EmployerDashboard = ({ onLogout, appliedJobs = [], applications = [], setApplications, userProfile, globalJobs = [], setGlobalJobs, goHome }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const myGigs = globalJobs.filter(job => job.postedByEmail === userProfile?.email);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Messaging overlay state
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState({});
  const [selectedAppId, setSelectedAppId] = useState(null);

  // Subscription state keyed by employer's email
  const [subscriptionState, setSubscriptionState] = useState(() => {
    try {
      const saved = localStorage.getItem(`subscription_${userProfile?.email}`);
      return saved ? JSON.parse(saved) : { credits: 0, subscriptionActiveUntil: null };
    } catch {
      return { credits: 0, subscriptionActiveUntil: null };
    }
  });

  const saveSubscriptionState = (newState) => {
    setSubscriptionState(newState);
    localStorage.setItem(`subscription_${userProfile?.email}`, JSON.stringify(newState));
  };

  const hasActiveSubscription = subscriptionState.subscriptionActiveUntil && new Date(subscriptionState.subscriptionActiveUntil) > new Date();
  const hasCredits = subscriptionState.credits > 0;
  const canPostGig = true;

  const handlePayment = (plan) => {
    // Open payment link in a new tab
    window.open("https://razorpay.me/@vishwanaththippayanadurgavenk", "_blank");
    
    // Simulate updating the account after successful payment
    if (plan === 'single') {
      saveSubscriptionState({
        ...subscriptionState,
        credits: subscriptionState.credits + 1
      });
      alert("Payment successful! 1 Credit added. You can now post a gig.");
    } else {
      saveSubscriptionState({
        ...subscriptionState,
        subscriptionActiveUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      alert("Payment successful! Unlimited plan activated for 1 month.");
    }
    setShowPaymentModal(false);
  };

  const handleAccept = async (app) => {
    try {
      const appId = app.id || app._id;
      const response = await fetch(`${API_BASE_URL}/api/applications/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId })
      });
      if (response.ok) {
        console.log('Application accepted successfully', appId);
        if (setApplications) {
          setApplications(prev => prev.map(a => (a.id === appId || a._id === appId) ? { ...a, status: 'Accepted' } : a));
        }
      } else {
        console.warn('Failed to accept application', response.status);
        // Fallback to optimistic UI update if backend status isn't 200 (useful during offline/mock state)
        if (setApplications) {
          setApplications(prev => prev.map(a => (a.id === appId || a._id === appId) ? { ...a, status: 'Accepted' } : a));
        }
      }
    } catch (err) {
      console.error('Error accepting application', err);
      // Fallback update
      if (setApplications) {
        setApplications(prev => prev.map(a => (a.id === app.id || a._id === app._id) ? { ...a, status: 'Accepted' } : a));
      }
    }
  };

  const handleDeleteJob = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn("Backend offline or error deleting job. Deleting locally.", err);
    }
    if (setGlobalJobs) {
      setGlobalJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`);
      if (response.ok) {
        const jobs = await response.json();
        if (setGlobalJobs) setGlobalJobs(jobs);
      }
    } catch (err) {
      console.warn('Failed to refresh jobs after posting:', err);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const location = formData.get('location');

    let latlng = null;

    // 1. Try Browser GPS first (Most accurate)
    const gps = await new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });

    if (gps) {
      latlng = gps;
    }

    // 2. Try Nominatim Geocoding
    if (!latlng) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          latlng = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    }

    // 3. Fallback to IP Location
    if (!latlng) {
      try {
        const ipRes = await fetch('https://ipwho.is/');
        const ipData = await ipRes.json();
        if (ipData && ipData.success && !isNaN(ipData.latitude) && !isNaN(ipData.longitude)) {
          latlng = [parseFloat(ipData.latitude), parseFloat(ipData.longitude)];
        } else {
          latlng = [28.6139, 77.2090]; // Delhi absolute fallback
        }
      } catch (e) {
        latlng = [28.6139, 77.2090];
      }
    }

    const newJob = {
      title,
      dept: formData.get('dept'),
      distance: parseFloat(formData.get('distance')) || 1.0,
      location,
      pay: formData.get('pay') || '₹300/hr',
      duration: formData.get('duration'),
      skillLevel: formData.get('skillLevel'),
      employerType: 'Local Business',
      type: 'In Person',
      tags: [title.split(' ')[0]],
      latlng,
      coordinates: { x: Math.floor(Math.random() * 70) + 15, y: Math.floor(Math.random() * 70) + 15 },
      postedByEmail: userProfile?.email || 'employer@example.com'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newJob)
      });
      if (response.ok) {
        const savedJob = await response.json();
        // Refresh the full job list to ensure consistency with backend
        await fetchJobs();
      } else {
        const fallbackJob = { ...newJob, id: Date.now() };
        if (setGlobalJobs) {
          setGlobalJobs(prev => [fallbackJob, ...prev]);
        }
        // Also attempt a refresh
        await fetchJobs();
      }
    } catch (err) {
      console.warn("Backend offline or error posting job. Posting locally.", err);
      const fallbackJob = { ...newJob, id: Date.now() };
      if (setGlobalJobs) {
        setGlobalJobs(prev => [fallbackJob, ...prev]);
      }
    }
    
    // Deduct credit if they don't have an active unlimited subscription
    if (!hasActiveSubscription && hasCredits) {
      saveSubscriptionState({
        ...subscriptionState,
        credits: subscriptionState.credits - 1
      });
    }

    setShowPostModal(false);
    e.target.reset();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
    { id: 'profile', label: 'Company Profile', icon: User },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="glass-panel" style={{ margin: '1.5rem 2rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="FlexiGig Logo" style={{ height: '40px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '600', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.75rem' }}>Employer</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.35rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem',
                  background: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  borderRadius: '12px', border: 'none', transition: 'all 0.3s', fontWeight: 600, fontSize: '0.95rem'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--accent)' : 'currentColor'} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem', borderRadius: '999px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-dark)', backgroundImage: userProfile?.profilePic ? `url(${userProfile.profilePic})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ paddingRight: '0.75rem' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', lineHeight: '1' }}>{userProfile?.name?.split(' ')[0] || 'Business'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.2rem' }}>Employer</p>
            </div>
          </div>
          <button onClick={goHome} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '12px', color: 'white', fontWeight: '600' }} className="card-hover">
            Home
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '1rem 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' ? (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-1px' }}>My Posted Gigs</h2>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                      {hasActiveSubscription ? 'Unlimited Plan Active' : `Credits Available: ${subscriptionState.credits}`}
                    </p>
                    <button onClick={() => setShowPaymentModal(true)} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      Buy More
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (!hasActiveSubscription && !hasCredits) {
                      setShowPaymentModal(true);
                    } else {
                      setShowPostModal(true);
                    }
                  }}
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'linear-gradient(135deg, var(--accent), #4c1d95)', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)' }}
                >
                  <Plus size={20} /> Post New Gig
                </button>
              </div>

              {/* Recent Applications & Student Tracking */}
              {(() => {
                const myApplications = applications.filter(app => myGigs.some(g => g.id === app.jobId));
                if (myApplications.length === 0) return null;

                const activeAppId = selectedAppId || (myApplications[0].id || myApplications[0]._id);
                const activeApp = myApplications.find(app => (app.id === activeAppId || app._id === activeAppId)) || myApplications[0];
                const appliedJob = myGigs.find(g => g.id === activeApp.jobId);
                const mockStudentLoc = activeApp.studentLoc || [28.6139, 77.2090]; 
                return (
                  <div className="glass-panel" style={{ marginBottom: '3rem', padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 10px 40px rgba(139, 92, 246, 0.15)' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem', color: 'white' }}>Recent Applications & Live Tracking</h3>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto' }} className="custom-scrollbar">
                        {myApplications.map((app, idx) => {
                          const job = myGigs.find(g => g.id === app.jobId);
                          const isSelected = (app.id || app._id) === activeAppId;
                          return (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedAppId(app.id || app._id)}
                              style={{ 
                                background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255,255,255,0.04)', 
                                padding: '1.25rem', 
                                borderRadius: '16px', 
                                borderLeft: isSelected ? '4px solid var(--accent)' : '4px solid #10b981',
                                border: isSelected ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.2rem' }}>{app.studentName}</h4>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{app.studentCollege} • {app.studentMajor}</p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Applied for: <strong style={{ color: 'white' }}>{job?.title}</strong></p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Location: <strong style={{ color: 'white' }}>{job?.location}</strong></p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: '600', fontSize: '0.85rem' }}>
                                <MapPin size={16} /> Location Tracking Active
                              </div>
                              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                                 <button 
                                   className={app.status === 'Accepted' ? "btn-secondary" : "btn-primary"} 
                                   style={{ 
                                     padding: '0.4rem 0.8rem', 
                                     fontSize: '0.85rem', 
                                     flex: 1, 
                                     background: app.status === 'Accepted' ? 'rgba(16, 185, 129, 0.1)' : 'linear-gradient(135deg, #10b981, #059669)', 
                                     border: app.status === 'Accepted' ? '1px solid #10b981' : 'none',
                                     color: app.status === 'Accepted' ? '#10b981' : 'white',
                                     boxShadow: 'none',
                                     cursor: app.status === 'Accepted' ? 'default' : 'pointer'
                                   }} 
                                   onClick={() => app.status !== 'Accepted' && handleAccept(app)}
                                   disabled={app.status === 'Accepted'}
                                 >
                                   {app.status === 'Accepted' ? 'Accepted' : 'Accept'}
                                 </button>
                                 <button 
                                   className="btn-secondary" 
                                   style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', flex: 1, cursor: 'pointer' }}
                                   onClick={() => {
                                     const studentEmail = app.studentEmail || 'student@example.com';
                                     setActiveChat(app);
                                     if (!chatHistory[studentEmail]) {
                                       setChatHistory(prev => ({
                                         ...prev,
                                         [studentEmail]: [
                                           { sender: 'student', text: `Hi, I applied to your gig: ${job?.title || 'Gig'}. I have relevant skills and am ready to start immediately!`, time: app.appliedAt || '12:00 PM' }
                                         ]
                                       }));
                                     }
                                   }}
                                 >
                                   Message
                                 </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ flex: '2 1 400px', height: '350px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <RealMap 
                          userRole="employer"
                          center={mockStudentLoc}
                          employerJob={appliedJob}
                          studentLocation={mockStudentLoc}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                {myGigs.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Briefcase size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Gigs Posted Yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Click the "Post New Gig" button to hire students.</p>
                  </div>
                ) : (
                  myGigs.map((job, index) => (
                    <motion.div 
                      key={job.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}
                      className="glass-panel card-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: appliedJobs.includes(job.id) ? '1px solid rgba(139, 92, 246, 0.4)' : undefined, boxShadow: appliedJobs.includes(job.id) ? '0 0 20px rgba(139, 92, 246, 0.15)' : undefined }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.4rem' }}>Job Available: {job.title}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: '600' }}>
                            <Building2 size={18} /> Business: {job.dept}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => {
                              if(setGlobalJobs) setGlobalJobs(globalJobs.map(j => j.id === job.id ? { ...j, status: 'Active' } : j));
                            }}
                            style={{ background: job.status !== 'Inactive' ? 'rgba(139, 92, 246, 0.15)' : 'transparent', color: job.status !== 'Inactive' ? 'var(--accent)' : 'var(--text-muted)', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700', border: job.status !== 'Inactive' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            Active
                          </button>
                          <button 
                            onClick={() => {
                              if(setGlobalJobs) setGlobalJobs(globalJobs.map(j => j.id === job.id ? { ...j, status: 'Inactive' } : j));
                            }}
                            style={{ background: job.status === 'Inactive' ? 'rgba(239, 68, 68, 0.15)' : 'transparent', color: job.status === 'Inactive' ? '#ef4444' : 'var(--text-muted)', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700', border: job.status === 'Inactive' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            Inactive
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e4e4e7', fontSize: '0.95rem' }}>
                          <MapPin size={18} color="var(--primary)" /> Location: {job.location || 'Local Campus Area'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e4e4e7', fontSize: '0.95rem' }}>
                          <IndianRupee size={18} color="var(--primary)" /> Pay: {job.pay}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e4e4e7', fontSize: '0.95rem' }}>
                          <Clock size={18} color="var(--primary)" /> Hours: {job.duration}
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <span style={{ fontSize: '0.95rem', color: appliedJobs.includes(job.id) ? 'var(--primary)' : 'var(--text-muted)', fontWeight: appliedJobs.includes(job.id) ? '800' : '500' }}>
                          {appliedJobs.includes(job.id) ? '🎉 1 Applicant' : '0 Applicants'}
                        </span>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <X size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Company Profile</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '300' }}>Manage your business presence on the platform.</p>
              </div>

              <div className="glass-panel" style={{ padding: '3rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    width: '180px', height: '180px', borderRadius: '24px', 
                    background: 'var(--bg-dark)', backgroundImage: userProfile?.profilePic ? `url(${userProfile.profilePic})` : 'none', 
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '6px solid rgba(139, 92, 246, 0.2)', boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)'
                  }} />
                  <button className="btn-secondary" style={{ marginTop: '1.5rem', width: '100%', borderRadius: '12px' }}>Edit Logo</button>
                  <button className="btn-primary" style={{ marginTop: '0.75rem', width: '100%', borderRadius: '12px' }}>Edit Profile</button>
                </div>
                
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.1', color: 'white' }}>{userProfile?.name || 'Local Business'}</h3>
                    <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: '600', marginTop: '0.5rem' }}>{userProfile?.businessType || 'Retail / Service'}</p>
                  </div>
                  
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                      {userProfile?.about || "We are a local business looking to hire highly motivated students from the campus. We provide flexible hours, competitive pay, and a great working environment!"}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <MapPin size={20} color="var(--primary)" /> 
                      <span style={{ color: 'white' }}>{userProfile?.address || '123 Business Rd'}</span>
                    </div>
                    {userProfile?.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Globe size={20} color="var(--primary)" /> 
                        <a href={userProfile.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{userProfile.website}</a>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <Mail size={20} color="var(--primary)" /> 
                      <span style={{ color: 'white' }}>contact@business.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showPostModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', position: 'relative', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              <button onClick={() => setShowPostModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
                <X size={28} />
              </button>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Post a New Gig</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Hire students directly from the campus network.</p>
              
              <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <input name="title" type="text" placeholder="Gig Title (e.g., Warehouse Assistant)" required className="modal-input" />
                <input name="dept" type="text" placeholder="Your Business Name" required className="modal-input" defaultValue={userProfile?.name} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                  <input name="pay" type="text" placeholder="Pay (e.g., ₹400/hr)" required className="modal-input" />
                  <input name="duration" type="text" placeholder="Duration (e.g., 5 hrs)" required className="modal-input" />
                  <input name="distance" type="number" step="0.1" min="0" placeholder="Distance to Campus (km)" required className="modal-input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                  <input name="location" type="text" placeholder="Full Address" required className="modal-input" defaultValue={userProfile?.address} />
                  <select name="skillLevel" required className="modal-input" style={{ appearance: 'none', cursor: 'pointer' }} defaultValue="Unskilled">
                    <option value="Unskilled">Unskilled (No Exp.)</option>
                    <option value="Skilled">Skilled (Requires Exp.)</option>
                  </select>
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowPostModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent), #4c1d95)', padding: '0.8rem 2rem' }}>Publish Gig</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        
        {activeChat && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            style={{ 
              position: 'fixed', bottom: '2rem', right: '2rem', width: '360px', height: '480px',
              background: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)', zIndex: 1000,
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* Chat Header */}
            <div style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(76, 29, 149, 0.2))', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white', margin: 0 }}>{activeChat.studentName}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Online • Candidate</span>
                </div>
              </div>
              <button onClick={() => setActiveChat(null)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }} className="card-hover">
                <X size={20} />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="custom-scrollbar">
              {(chatHistory[activeChat.studentEmail || 'student@example.com'] || []).map((msg, idx) => {
                const isMe = msg.sender === 'employer';
                return (
                  <div key={idx} style={{ 
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                    background: isMe ? 'linear-gradient(135deg, var(--accent), #6d28d9)' : 'rgba(255,255,255,0.06)',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {msg.text}
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right', marginTop: '0.25rem' }}>{msg.time}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Chat Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatMessage.trim()) return;
                const studentEmail = activeChat.studentEmail || 'student@example.com';
                const newMsg = {
                  sender: 'employer',
                  text: chatMessage,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setChatHistory(prev => ({
                  ...prev,
                  [studentEmail]: [...(prev[studentEmail] || []), newMsg]
                }));
                setChatMessage('');
                
                // Simulate candidate reply after a short delay
                setTimeout(() => {
                  const replies = [
                    "Sounds great! Thank you so much for the opportunity.",
                    "Yes, I am available at that time. I will be there!",
                    "Awesome, I have already updated my calendar. Looking forward to it!",
                    "Thank you! I will review the instructions and see you soon."
                  ];
                  const randomReply = replies[Math.floor(Math.random() * replies.length)];
                  setChatHistory(prev => ({
                    ...prev,
                    [studentEmail]: [
                      ...(prev[studentEmail] || []),
                      { sender: 'student', text: randomReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                    ]
                  }));
                }, 1500);
              }}
              style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '0.5rem' }}
            >
              <input 
                type="text" 
                value={chatMessage} 
                onChange={(e) => setChatMessage(e.target.value)} 
                placeholder="Type a message..." 
                style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.6rem 1rem', color: 'white', outline: 'none', fontSize: '0.9rem' }} 
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', background: 'var(--accent)', fontSize: '0.85rem' }}>Send</button>
            </form>
          </motion.div>
        )}
        
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center' }}
            >
              <button onClick={() => setShowPaymentModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
                <X size={28} />
              </button>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Choose a Plan</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>To post gigs and hire students, please select a plan below. Payments are securely processed via Razorpay.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>Single Gig</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Post 1 job listing</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent)' }}>₹29</span>
                    <button onClick={() => handlePayment('single')} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>Pay Now</button>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '0', left: '0', background: 'var(--accent)', color: 'white', fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.75rem', borderBottomRightRadius: '8px' }}>BEST VALUE</div>
                  <div style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>Unlimited Plan</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Unlimited gigs for 1 month</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent)' }}>₹199</span>
                    <button onClick={() => handlePayment('unlimited')} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--accent), #4c1d95)' }}>Pay Now</button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                After payment, your credits will be updated shortly by our team.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .modal-input {
          width: 100%; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 1.1rem; border-radius: 12px; color: white; font-family: inherit; font-size: 1rem; transition: all 0.3s ease;
        }
        .modal-input:focus { outline: none; border-color: var(--accent); background: rgba(255, 255, 255, 0.06); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
        .modal-input option { background: var(--bg-dark); color: white; }
      `}</style>
    </div>
  );
};

export default EmployerDashboard;
