import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, IndianRupee, Clock, MapPin, X, Navigation, Building2, User, Globe, Mail, Star } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { userProfile, logout, updateProfile: onUpdateProfile } = useAuth();
  const { globalJobs, setGlobalJobs, applications, setApplications, fetchJobs } = useJobs();
  const [currentView, setCurrentView] = useState('dashboard');
  const myGigs = globalJobs.filter(job => job.postedByEmail === userProfile?.email);
  const appliedJobs = applications ? applications.map(app => app.jobId?.id || app.jobId?._id || app.jobId) : [];
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const fileInputRef = useRef(null);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const submitFeedback = (e) => {
    e.preventDefault();
    if (setApplications && feedbackTarget) {
      setApplications(prev => prev.map(a => 
        ((a.id && a.id === feedbackTarget.id) || (a._id && a._id === feedbackTarget._id))
          ? { ...a, employerRated: true }
          : a
      ));
    }
    setShowFeedbackModal(false);
    setFeedbackTarget(null);
    setRating(0);
    setFeedbackText('');
  };
  
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

  const handleReject = async (app) => {
    try {
      const appId = app.id || app._id;
      const response = await fetch(`${API_BASE_URL}/api/applications/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId })
      });
      if (response.ok) {
        console.log('Application rejected successfully', appId);
        if (setApplications) {
          setApplications(prev => prev.map(a => (a.id === appId || a._id === appId) ? { ...a, status: 'Rejected' } : a));
        }
      } else {
        console.warn('Failed to reject application', response.status);
        if (setApplications) {
          setApplications(prev => prev.map(a => (a.id === appId || a._id === appId) ? { ...a, status: 'Rejected' } : a));
        }
      }
    } catch (err) {
      console.error('Error rejecting application', err);
      if (setApplications) {
        setApplications(prev => prev.map(a => (a.id === app.id || a._id === app._id) ? { ...a, status: 'Rejected' } : a));
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



  const [isPosting, setIsPosting] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const handleEditJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const description = formData.get('description');
    const updatedJob = {
      ...editingJob,
      pay: formData.get('pay'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      duration: `${formData.get('startTime')} to ${formData.get('endTime')}`,
      description,
      title: description.substring(0, 30) + (description.length > 30 ? '...' : '')
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${editingJob.id || editingJob._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJob)
      });
      if (response.ok) {
        await fetchJobs();
      } else {
         if (setGlobalJobs) setGlobalJobs(prev => prev.map(j => j.id === editingJob.id ? updatedJob : j));
      }
    } catch (err) {
      if (setGlobalJobs) setGlobalJobs(prev => prev.map(j => j.id === editingJob.id ? updatedJob : j));
    }
    setEditingJob(null);
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (isPosting) return;
    setIsPosting(true);
    
    const formData = new FormData(e.target);
    const description = formData.get('description');
    const title = description.substring(0, 30) + (description.length > 30 ? '...' : '');

    let latlng = null;
    let locationString = 'Local Area';

    // 1. Try Browser GPS first (Most accurate)
    const gps = await new Promise((resolve) => {
      try {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } catch (err) {
        console.warn("Geolocation API call failed synchronously:", err);
        resolve(null);
      }
    }).catch(() => null);

    if (gps) {
      latlng = gps;
    }

    if (latlng) {
      // Reverse Geocode
      try {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng[0]},${latlng[1]}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          locationString = data.results[0].formatted_address;
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
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
      description,
      dept: userProfile?.name || 'Local Business',
      location: locationString,
      pay: formData.get('pay') || '₹300/hr',
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      duration: `${formData.get('startTime')} to ${formData.get('endTime')}`,
      employerType: 'Local Business',
      type: 'In Person',
      tags: [],
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
    setIsPosting(false);
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
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '600', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.75rem' }}>Business Owner</span>
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
              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.2rem' }}>Business Owner</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '12px', color: 'white', fontWeight: '600' }} className="card-hover">
            Home
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'transparent', border: 'none', color: '#f87171', fontWeight: '600', cursor: 'pointer', borderRadius: '12px', transition: 'all 0.2s', width: '100%' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Sign Out
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

              {/* Recent Applications */}
              {(() => {
                const myApplications = applications.filter(app => myGigs.some(g => g.id === (app.jobId?.id || app.jobId?._id || app.jobId)));
                if (myApplications.length === 0) return null;

                return (
                  <div className="glass-panel" style={{ marginBottom: '3rem', padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 10px 40px rgba(139, 92, 246, 0.15)' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem', color: 'white' }}>Recent Applications</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {myApplications.map((app, idx) => {
                        const job = myGigs.find(g => g.id === (app.jobId?.id || app.jobId?._id || app.jobId));
                        return (
                          <div 
                            key={idx} 
                            style={{ 
                              background: 'rgba(255,255,255,0.04)', 
                              padding: '1.5rem', 
                              borderRadius: '16px', 
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <div>
                              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.3rem', color: 'white' }}>{app.studentName}</h4>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{app.studentCollege} • {app.studentMajor}</p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Applied for: <strong style={{ color: 'white' }}>{job?.title}</strong></p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>Location: <strong style={{ color: 'white' }}>{job?.location}</strong></p>
                            </div>
                            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                              {app.status === 'Pending' ? (
                                <>
                                  <button 
                                    className="btn-primary" 
                                    style={{ 
                                      padding: '0.5rem 1rem', 
                                      fontSize: '0.9rem', 
                                      flex: 1, 
                                      background: 'linear-gradient(135deg, #10b981, #059669)', 
                                      color: 'white',
                                      border: 'none',
                                      cursor: 'pointer',
                                      borderRadius: '8px',
                                      fontWeight: '600'
                                    }} 
                                    onClick={() => handleAccept(app)}
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    className="btn-primary" 
                                    style={{ 
                                      padding: '0.5rem 1rem', 
                                      fontSize: '0.9rem', 
                                      flex: 1, 
                                      background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                                      color: 'white',
                                      border: 'none',
                                      cursor: 'pointer',
                                      borderRadius: '8px',
                                      fontWeight: '600'
                                    }} 
                                    onClick={() => handleReject(app)}
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <button 
                                  className={app.status === 'Completed' ? 'btn-primary' : "btn-secondary"} 
                                  style={{ 
                                    padding: '0.5rem 1rem', 
                                    fontSize: '0.9rem', 
                                    flex: 1, 
                                    background: app.status === 'Completed' && !app.employerRated ? '#fbbf24' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                                    border: app.status === 'Rejected' ? '1px solid #ef4444' : '1px solid #10b981',
                                    color: app.status === 'Completed' && !app.employerRated ? 'black' : app.status === 'Rejected' ? '#ef4444' : '#10b981',
                                    boxShadow: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: app.status === 'Completed' && !app.employerRated ? 'pointer' : 'default'
                                  }} 
                                  onClick={() => {
                                    if (app.status === 'Completed' && !app.employerRated) {
                                      setFeedbackTarget(app);
                                      setShowFeedbackModal(true);
                                    }
                                  }}
                                  disabled={app.status !== 'Completed' || app.employerRated}
                                >
                                  {app.employerRated ? 'Rated' : app.status === 'Completed' ? 'Rate User' : app.status}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                {myGigs.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Briefcase size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Gigs Posted Yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Click the "Post New Gig" button to hire users.</p>
                  </div>
                ) : (
                  myGigs.map((job, index) => (
                    <motion.div 
                      key={job.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}
                      className="glass-panel card-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: appliedJobs.includes(job.id) ? '1px solid rgba(139, 92, 246, 0.4)' : undefined, boxShadow: appliedJobs.includes(job.id) ? '0 0 20px rgba(139, 92, 246, 0.15)' : undefined }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.4rem' }}>{job.title}</h3>
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

                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <button 
                          onClick={() => setEditingJob(job)}
                          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          Edit Details
                        </button>
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
                  <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (onUpdateProfile) onUpdateProfile({ profilePic: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <button onClick={() => fileInputRef.current?.click()} className="btn-secondary" style={{ marginTop: '1.5rem', width: '100%', borderRadius: '12px' }}>Edit Logo</button>
                  <button onClick={() => {
                    setEditData({ name: userProfile?.name || '', businessType: userProfile?.businessType || '', location: userProfile?.location || userProfile?.address || '', about: userProfile?.about || '', website: userProfile?.website || '' });
                    setIsEditing(true);
                  }} className="btn-primary" style={{ marginTop: '0.75rem', width: '100%', borderRadius: '12px' }}>Edit Profile</button>
                </div>
                
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.1', color: 'white' }}>{userProfile?.name || 'Local Business'}</h3>
                    <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: '600', marginTop: '0.5rem' }}>{userProfile?.businessType || 'Retail / Service'}</p>
                  </div>
                  
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                      {userProfile?.about || "We are a local business looking to hire highly motivated users from the campus. We provide flexible hours, competitive pay, and a great working environment!"}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <MapPin size={20} color="var(--primary)" /> 
                      <span style={{ color: 'white' }}>{userProfile?.location || userProfile?.address || '123 Business Rd'}</span>
                    </div>
                    {userProfile?.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Globe size={20} color="var(--primary)" /> 
                        <a href={userProfile.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{userProfile.website}</a>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <Mail size={20} color="var(--primary)" /> 
                      <span style={{ color: 'white' }}>{userProfile?.email || 'contact@business.com'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                      className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', border: '1px solid var(--accent)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                    >
                      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' }}>Edit Company Profile</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Company Name" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%' }} />
                        <input type="text" value={editData.businessType} onChange={e => setEditData({...editData, businessType: e.target.value})} placeholder="Business Type (e.g., Retail, Cafe)" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%' }} />
                        <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} placeholder="Address / Location" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%' }} />
                        <input type="text" value={editData.website} onChange={e => setEditData({...editData, website: e.target.value})} placeholder="Website URL (Optional)" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%' }} />
                        <textarea value={editData.about} onChange={e => setEditData({...editData, about: e.target.value})} placeholder="About the business..." rows={4} style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%', resize: 'vertical' }} />
                        
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                          <button onClick={() => {
                            if (onUpdateProfile) onUpdateProfile(editData);
                            setIsEditing(false);
                          }} className="btn-primary" style={{ flex: 1 }}>Save Changes</button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Hire users directly from the campus network.</p>
              
              <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <textarea name="description" placeholder="Gig Details & Description (e.g., Looking for a warehouse assistant to move boxes...)" required className="modal-input" rows={4} style={{ resize: 'vertical' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                  <input name="pay" type="text" placeholder="Job Amount / Payment (e.g., ₹500 total or ₹200/hr)" required className="modal-input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Start Time</label>
                    <input name="startTime" type="datetime-local" required className="modal-input" />
                  </div>
                  <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>End Time</label>
                    <input name="endTime" type="datetime-local" required className="modal-input" />
                  </div>
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowPostModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={isPosting} className="btn-primary" style={{ background: isPosting ? '#6b7280' : 'linear-gradient(135deg, var(--accent), #4c1d95)', padding: '0.8rem 2rem', cursor: isPosting ? 'not-allowed' : 'pointer' }}>
                    {isPosting ? 'Publishing & Fetching Location...' : 'Publish Gig'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        
        {editingJob && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', position: 'relative', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              <button onClick={() => setEditingJob(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
                <X size={28} />
              </button>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Edit Gig</h2>
              
              <form onSubmit={handleEditJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <textarea name="description" defaultValue={editingJob.description || editingJob.title} placeholder="Gig Details & Description" required className="modal-input" rows={4} style={{ resize: 'vertical' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                  <input name="pay" type="text" defaultValue={editingJob.pay} placeholder="Job Amount / Payment" required className="modal-input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Start Time</label>
                    <input name="startTime" defaultValue={editingJob.startTime} type="datetime-local" required className="modal-input" />
                  </div>
                  <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>End Time</label>
                    <input name="endTime" defaultValue={editingJob.endTime} type="datetime-local" required className="modal-input" />
                  </div>
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setEditingJob(null)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent), #4c1d95)', padding: '0.8rem 2rem' }}>
                    Save Changes
                  </button>
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
        
        {showFeedbackModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', border: '1px solid var(--primary)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              <button onClick={() => setShowFeedbackModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
                <X size={24} />
              </button>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Rate Student</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Provide feedback for <strong>{feedbackTarget?.studentName}</strong></p>
              
              <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={36} 
                      onClick={() => setRating(star)}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      fill={star <= rating ? "#fbbf24" : "none"} 
                      color={star <= rating ? "#fbbf24" : "var(--border-color)"}
                    />
                  ))}
                </div>
                <textarea 
                  value={feedbackText} 
                  onChange={e => setFeedbackText(e.target.value)} 
                  placeholder="How was it working with this student? (Optional)" 
                  rows={4} 
                  style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%', resize: 'vertical' }} 
                />
                <button type="submit" className="btn-primary" disabled={rating === 0} style={{ padding: '1rem', fontSize: '1.05rem', opacity: rating === 0 ? 0.5 : 1, cursor: rating === 0 ? 'not-allowed' : 'pointer' }}>
                  Submit Rating
                </button>
              </form>
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
