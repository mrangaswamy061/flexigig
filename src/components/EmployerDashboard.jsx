import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, IndianRupee, Clock, MapPin, X, Navigation, Building2, User, Globe, Mail } from 'lucide-react';
import RealMap from './RealMap';
import { API_BASE_URL } from '../config';

const EmployerDashboard = ({ onLogout, appliedJobs = [], applications = [], userProfile, globalJobs = [], setGlobalJobs, goHome }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const myGigs = globalJobs.filter(job => job.postedByEmail === userProfile?.email);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
  const canPostGig = hasActiveSubscription || hasCredits;

  const handleAccept = async (app) => {
    try {
      // Placeholder: send accept request to backend (adjust endpoint as needed)
      const response = await fetch(`${API_BASE_URL}/api/applications/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id })
      });
      if (response.ok) {
        console.log('Application accepted', app.id);
        // Optionally update UI state if you have a setter for applications
      } else {
        console.warn('Failed to accept application', response.status);
      }
    } catch (err) {
      console.error('Error accepting application', err);
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // 'single' or 'unlimited'
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  const handlePostJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const location = formData.get('location');

    let latlng = [28.6139, 77.2090];
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        latlng = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setMapCenter(latlng);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }

    const newJob = {
      title,
      dept: formData.get('dept'),
      distance: parseFloat(formData.get('distance')) || 1.0,
      location,
      pay: formData.get('pay'),
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
        if (setGlobalJobs) {
          setGlobalJobs(prev => [savedJob, ...prev]);
        }
      } else {
        const fallbackJob = { ...newJob, id: Date.now() };
        if (setGlobalJobs) {
          setGlobalJobs(prev => [fallbackJob, ...prev]);
        }
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '300', margin: 0 }}>Manage the gigs you've posted for students.</p>
                    {hasActiveSubscription ? (
                      <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.3rem 0.8rem', borderRadius: '999px', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        🛡️ Unlimited Plan Active
                      </span>
                    ) : hasCredits ? (
                      <span style={{ fontSize: '0.8rem', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '0.3rem 0.8rem', borderRadius: '999px', fontWeight: '700', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        💎 {subscriptionState.credits} Post Credit{subscriptionState.credits > 1 ? 's' : ''} Left
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.3rem 0.8rem', borderRadius: '999px', fontWeight: '700', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        ⚠️ Plan Expired (Buy Credits to Post Gigs)
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (canPostGig) {
                      setShowPostModal(true);
                    } else {
                      setShowPaymentModal(true);
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

                const firstApp = myApplications[0];
                const appliedJob = myGigs.find(g => g.id === firstApp.jobId);
                const mockStudentLoc = firstApp.studentLoc || [28.6139, 77.2090]; 
                return (
                  <div className="glass-panel" style={{ marginBottom: '3rem', padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 10px 40px rgba(139, 92, 246, 0.15)' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem', color: 'white' }}>Recent Applications & Live Tracking</h3>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto' }} className="custom-scrollbar">
                        {myApplications.map((app, idx) => {
                          const job = myGigs.find(g => g.id === app.jobId);
                          return (
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
                              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.2rem' }}>{app.studentName}</h4>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{app.studentCollege} • {app.studentMajor}</p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Applied for: <strong style={{ color: 'white' }}>{job?.title}</strong></p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Location: <strong style={{ color: 'white' }}>{job?.location}</strong></p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: '600', fontSize: '0.85rem' }}>
                                <MapPin size={16} /> Location Tracking Active
                              </div>
                              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                 <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: 'none' }} onClick={() => handleAccept(app)}>Accept</button>
                                 <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', flex: 1 }}>Message</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ flex: '2 1 400px', height: '350px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <RealMap 
                          userRole="employer"
                          center={appliedJob?.latlng || [28.6239, 77.2000]}
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
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 101, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="glass-panel" style={{ width: '100%', maxWidth: '750px', padding: '3rem', position: 'relative', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
            >
              <button 
                onClick={() => {
                  setShowPaymentModal(false);
                  setIsVerifying(false);
                  setPaymentSuccess(false);
                  setSelectedPlan(null);
                }} 
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}
              >
                <X size={28} />
              </button>

              {paymentSuccess ? (
                // Success screen
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 0' }}
                >
                  <div style={{ 
                    width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', 
                    border: '2px solid #10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', 
                    marginBottom: '2rem', boxShadow: '0 0 35px rgba(16, 185, 129, 0.4)' 
                  }}>
                    <motion.span 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                      style={{ fontSize: '2.5rem', color: '#10b981' }}
                    >
                      ✓
                    </motion.span>
                  </div>
                  <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.75rem', color: 'white' }}>Payment Verified!</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    Your posting plan has been successfully credited and unlocked. You can now post your gig!
                  </p>
                  <button 
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentSuccess(false);
                      setSelectedPlan(null);
                      setShowPostModal(true); // Open the post gig modal!
                    }}
                    className="btn-primary" 
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.9rem 2.5rem', borderRadius: '999px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 5px 20px rgba(16, 185, 129, 0.3)' }}
                  >
                    Post Gig Now
                  </button>
                </motion.div>
              ) : isVerifying ? (
                // Verification screen
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div className="lucide-spin" style={{ margin: '0 auto 2rem', width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(139, 92, 246, 0.2)', borderTopColor: 'var(--accent)' }}></div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>Verifying Your Payment</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
                    We launched your secure Razorpay checkout page in a new window. Please complete the transfer of <strong>{selectedPlan === 'single' ? '₹29' : '₹199'}</strong>, then click below to instantly unlock.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button 
                      onClick={() => {
                        setIsVerifying(false);
                        setSelectedPlan(null);
                      }} 
                      className="btn-secondary" 
                      style={{ padding: '0.85rem 1.8rem', borderRadius: '12px' }}
                    >
                      Go Back
                    </button>
                    <button 
                      onClick={() => {
                        // Simulate verified delay
                        setTimeout(() => {
                          if (selectedPlan === 'single') {
                            saveSubscriptionState({
                              ...subscriptionState,
                              credits: subscriptionState.credits + 1
                            });
                          } else {
                            const oneMonthFromNow = new Date();
                            oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30);
                            saveSubscriptionState({
                              ...subscriptionState,
                              subscriptionActiveUntil: oneMonthFromNow.toISOString()
                            });
                          }
                          setPaymentSuccess(true);
                          setIsVerifying(false);
                        }, 800);
                      }}
                      className="btn-primary" 
                      style={{ padding: '0.85rem 2.2rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent), #4c1d95)' }}
                    >
                      Verify & Unlock Gig
                    </button>
                  </div>
                </div>
              ) : (
                // Plan Selector Screen
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem', color: 'white' }}>Choose Your Gig Posting Plan</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '300' }}>Access motivated student talent across local and campus communities.</p>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Single Pass Card */}
                    <div className="glass-panel card-hover" style={{ flex: '1 1 300px', padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px' }}>One-time Pass</span>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.5rem 0' }}>Single Gig Post</h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', margin: '1rem 0' }}>
                        <span style={{ fontSize: '3rem', fontWeight: '900', color: 'white' }}>₹29</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/per gig post</span>
                      </div>
                      <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✨ <span>Post 1 high-visibility gig</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🗺️ <span>Live radar tracking active</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📁 <span>Review student applications</span></div>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedPlan('single');
                          setIsVerifying(true);
                          window.open('https://razorpay.me/@vishwanaththippayanadurgavenk', '_blank', 'noopener,noreferrer');
                        }}
                        className="btn-secondary" 
                        style={{ marginTop: 'auto', width: '100%', padding: '0.85rem', borderRadius: '12px', fontWeight: '700', fontSize: '1rem' }}
                      >
                        Buy Gig Pass
                      </button>
                    </div>

                    {/* Monthly Subscription Card */}
                    <div className="glass-panel card-hover" style={{ flex: '1 1 300px', padding: '2rem', display: 'flex', flexDirection: 'column', border: '2px solid rgba(139, 92, 246, 0.4)', background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(0,0,0,0.6) 100%)', borderRadius: '20px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent)', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.5px' }}>BEST VALUE</div>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: '700', letterSpacing: '1px' }}>Monthly Membership</span>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.5rem 0' }}>Premium Monthly</h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', margin: '1rem 0' }}>
                        <span style={{ fontSize: '3rem', fontWeight: '900', color: 'white' }}>₹199</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/per month</span>
                      </div>
                      <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🚀 <span>Post <strong>unlimited gigs</strong></span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚡ <span>Priority live radar placement</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🛡️ <span>Featured employer badge</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📅 <span>Active unlimited for 30 days</span></div>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedPlan('unlimited');
                          setIsVerifying(true);
                          window.open('https://razorpay.me/@vishwanaththippayanadurgavenk', '_blank', 'noopener,noreferrer');
                        }}
                        className="btn-primary" 
                        style={{ marginTop: 'auto', width: '100%', padding: '0.85rem', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', background: 'linear-gradient(135deg, var(--accent), #4c1d95)', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}
                      >
                        Subscribe Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
