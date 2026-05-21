import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, Users, MapPin, Zap, Shield, Star } from 'lucide-react';

const Home = ({ onGoToLogin }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background Glow Effects */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12), transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent 60%)', pointerEvents: 'none' }} />

      {/* Top Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="FlexiGig Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => onGoToLogin(null, true)} 
            style={{ padding: '0.7rem 1.75rem', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s' }}
            className="btn-primary card-hover"
          >
            Log In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem 3rem 4rem', position: 'relative', zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid rgba(212, 175, 55, 0.2)', marginBottom: '2rem' }}>
            <Zap size={16} fill="currentColor" /> Campus Gig Marketplace
          </div>

          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: '900', letterSpacing: '-2px', lineHeight: '1.1', marginBottom: '1.5rem', maxWidth: '800px' }}>
            Find <span style={{ color: 'var(--primary)', textShadow: '0 0 40px rgba(212, 175, 55, 0.3)' }}>Flexible Gigs</span>
            <br />Near Your Campus
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: '400', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.7' }}>
            Connect with local businesses, earn on your schedule, and build real-world experience — all within walking distance.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onGoToLogin('student', true)} 
              className="btn-primary"
              style={{ padding: '1.1rem 2.5rem', fontSize: '1.15rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 30px rgba(212, 175, 55, 0.35)' }}
            >
              Student Log In <ArrowRight size={22} />
            </button>
            <button 
              onClick={() => onGoToLogin('employer', true)} 
              style={{ padding: '1.1rem 2.5rem', fontSize: '1.15rem', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: 'var(--accent)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.3s' }}
              className="card-hover"
            >
              Employer Log In <Users size={22} />
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
          style={{ display: 'flex', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {[
            { value: '2,500+', label: 'Active Students' },
            { value: '850+', label: 'Gigs Posted' },
            { value: '₹5L+', label: 'Earned by Students' },
            { value: '4.9★', label: 'Avg Rating' }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', letterSpacing: '-1px' }}>{stat.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '5rem', width: '100%', maxWidth: '900px' }}
        >
          {[
            { icon: MapPin, title: 'Nearby Gigs', desc: 'Discover opportunities within walking distance of campus with our live radar map.', color: 'var(--primary)' },
            { icon: Zap, title: '1-Click Apply', desc: 'Apply to any gig instantly. No cover letters, no hassle — just tap and go.', color: 'var(--accent)' },
            { icon: Shield, title: 'Verified & Safe', desc: 'All employers are verified. Your student data is encrypted and secure.', color: '#fbbf24' }
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="glass-panel card-hover" style={{ padding: '2rem', textAlign: 'left' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: `${feat.color}15`, border: `1px solid ${feat.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Icon size={24} color={feat.color} />
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{feat.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{feat.desc}</p>
              </div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '2rem 3rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 FlexiGig. All rights reserved.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Built for students, by students.</p>
      </footer>
    </motion.div>
  );
};

export default Home;
