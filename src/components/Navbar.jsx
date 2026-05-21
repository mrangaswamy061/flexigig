import React, { useState } from 'react';
import { Briefcase, User, LayoutDashboard, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ currentView, setCurrentView, userProfile, goHome }) => {
  const [showNotifications, setShowNotifications] = useState(false);
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
      position: 'sticky',
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
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--border-color)',
              padding: '0.6rem',
              borderRadius: '50%',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }} className="card-hover">
            <Bell size={20} />
            <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--bg-dark)' }} />
          </button>
          
          {showNotifications && (
            <div style={{ 
              position: 'absolute', top: '120%', right: '-10px', width: '300px', 
              background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px', padding: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', zIndex: 100 
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Notifications</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'white' }}>New Gig Match!</strong><br/>A new gig was posted matching your skills.
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'white' }}>Application Viewed</strong><br/>An employer just reviewed your application.
                </div>
              </div>
            </div>
          )}
        </div>
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
