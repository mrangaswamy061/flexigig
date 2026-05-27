import React, { useState, useEffect } from 'react';

import { motion } from 'framer-motion';

const Navbar = ({ currentView, setCurrentView, userProfile, goHome }) => {
  useEffect(() => {
    const handleClickOutside = (e) => {
      // If click is not on the bell button or within the dropdown, close it
      const bell = document.getElementById('notification-bell');
      const dropdown = document.getElementById('notification-dropdown');
      if (bell && bell.contains(e.target)) return;
      if (dropdown && dropdown.contains(e.target)) return;
      setShowNotifications(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  // Fetch notifications (mock implementation)
  useEffect(() => {
    // In a real app, replace this with an API call e.g., fetch('/api/notifications?email=' + (userProfile?.email || ''))
    const mockData = [
      { title: 'New Gig Match!', message: 'A new gig was posted matching your skills.' },
      { title: 'Application Viewed', message: 'An employer just reviewed your application.' }
    ];
    setNotifications(mockData);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Find Gigs', icon: Briefcase },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="glass-panel" style={{
      margin: '1.5rem 2rem',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      overflow: 'visible',
      top: '1.5rem',
      zIndex: 50,
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setCurrentView('dashboard')}>
        <img src="/logo.png" alt="FlexiGig Logo" style={{ height: '55px', objectFit: 'contain' }} />
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
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-muted)',
                borderRadius: '12px',
                border: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div layoutId="nav-pill" style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: '20px', height: '3px', background: 'var(--primary)', borderRadius: '4px' }} />
              )}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', lineHeight: '1' }}>{userProfile?.name?.split(' ')[0] || 'Alex'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>Student</p>
          </div>
        </div>
        <button 
          onClick={goHome} 
          title="Back to Home"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '0.55rem 1.1rem', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.3s' }}
          className="card-hover"
        >
          Home
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
