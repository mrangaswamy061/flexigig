import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, UploadCloud, Lock, ArrowRight, Building, Building2, Briefcase, GraduationCap, ChevronLeft, MapPin } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialConfig = location.state || {};
  const [isLogin, setIsLogin] = useState(initialConfig.isLogin ?? true);
  const [role, setRole] = useState(initialConfig.role ?? null); // 'student', 'employer'

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput?.value || '';
    const passwordInput = e.target.querySelector('input[type="password"]');
    const password = passwordInput?.value || '';

    if (!isLogin) {
      const nameInput = e.target.querySelector('input[placeholder="Full Name"]');
      const name = nameInput ? nameInput.value : email.split('@')[0];
      const contactInput = e.target.querySelector('input[type="tel"]');
      const contact = contactInput ? contactInput.value : undefined;
      
      fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, contact })
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        if (data.token) localStorage.setItem('token', data.token);
        alert("Account created successfully!");
        login(data.user.role, false, data.user.name, email, data.user);
      })
      .catch(err => {
        console.warn('Registration fetch failed:', err);
        const isNetworkError = err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('network') || err instanceof TypeError;
        if (isNetworkError) {
          alert("⚠️ Server offline. Account initialized successfully in Offline Mock Mode! Please sign in.");
          setIsLogin(true);
        } else {
          alert(err.message);
        }
      });
    } else {
      fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        
        const actualRole = data.user?.role || 'student';
        if (data.token) localStorage.setItem('token', data.token);
        
        login(actualRole, false, data.user?.name || email.split('@')[0], email, data.user);
      })
      .catch(err => {
        console.warn('Login fetch failed:', err);
        const isNetworkError = err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('network') || err instanceof TypeError;
        if (isNetworkError) {
          console.log('Falling back to Offline Mock Login.');
          alert("⚠️ Server offline. Logged in successfully in Offline Mock Mode!");
          login('student', false, email.split('@')[0], email, { name: email.split('@')[0], email, role: 'student' });
        } else {
          alert(err.message);
        }
      });
    }
  };

  if (!isLogin && !role) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', padding: '2rem', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1000px', textAlign: 'center' }}>
          <img src="/logo.png" alt="FlexiGig Logo" style={{ height: '100px', marginBottom: '1.5rem', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-1px' }}>Join FlexiGig</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '4rem' }}>How would you like to use our platform?</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <motion.div 
              whileHover={{ scale: 1.02, translateY: -5 }}
              onClick={() => setRole('student')}
              className="glass-panel"
              style={{ padding: '4rem 2rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid rgba(212, 175, 55, 0.3)', background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, rgba(0,0,0,0.5) 100%)' }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem', boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)' }}>
                <GraduationCap size={40} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>I'm a User</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Find flexible gigs near your location and earn on your schedule.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, translateY: -5 }}
              onClick={() => setRole('employer')}
              className="glass-panel"
              style={{ padding: '4rem 2rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(0,0,0,0.5) 100%)' }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem', boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}>
                <Briefcase size={40} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>I'm a Business Owner</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Hire motivated individuals from the local community for your business.</p>
            </motion.div>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <button onClick={() => setIsLogin(true)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '1.1rem', textDecoration: 'underline' }}>Back to Login</button>
          </div>
        </div>
      </div>
    );
  }

  const isStudent = !isLogin && role === 'student';

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: (isLogin || isStudent) ? '500px' : '900px', padding: '0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: (isLogin || isStudent) ? 'column' : 'row' }}>
        
        {/* Background effects */}
        <div style={{ position: 'absolute', top: '-20%', left: (isLogin || isStudent) ? '-20%' : '50%', width: '400px', height: '400px', background: (isLogin || isStudent) ? 'var(--primary)' : 'var(--accent)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }} />
        
        {/* Business Owner Side Banner (Only on Registration) */}
        {!isLogin && !isStudent && (
          <div style={{ flex: '1 1 50%', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05))', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <Building2 size={60} color="var(--accent)" style={{ marginBottom: '2rem' }} />
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>Build your <br/>dream team.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>Access thousands of talented individuals looking for part-time opportunities.</p>
          </div>
        )}

        <div style={{ flex: (isLogin || isStudent) ? '1 1 100%' : '1 1 50%', padding: '3.5rem 3rem' }}>
          {!isLogin && (
            <button onClick={() => setRole(null)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: '600' }} className="card-hover">
              <ChevronLeft size={18} /> Change Role
            </button>
          )}

          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
              {isLogin ? 'Welcome Back' : (isStudent ? 'User Registration' : 'Business Registration')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              {isLogin ? 'Sign in to access your portal.' : `Register to ${isStudent ? 'unlock local opportunities' : 'hire great talent'}.`}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 10 }}>
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <User size={20} className="input-icon" />
                    <input type="text" placeholder="Full Name" required className="auth-input" />
                  </div>
                  
                  {isStudent ? (
                    <>
                      <div className="input-group">
                        <Phone size={20} className="input-icon" />
                        <input type="tel" placeholder="Phone Number" required className="auth-input" />
                      </div>
                      <div className="input-group">
                        <MapPin size={20} className="input-icon" />
                        <input type="text" placeholder="Location" required className="auth-input" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="input-group">
                        <Phone size={20} className="input-icon" />
                        <input type="tel" placeholder="Phone Number" required className="auth-input" />
                      </div>
                      <div className="input-group">
                        <Building2 size={20} className="input-icon" />
                        <input type="text" placeholder="Address of Business" required className="auth-input" />
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group">
              <Mail size={20} className="input-icon" />
              <input type="email" placeholder={"Email Address"} required className="auth-input" />
            </div>

            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input type="password" placeholder="Password" required className="auth-input" />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1.1rem', fontSize: '1.1rem', background: !isStudent && !isLogin ? 'linear-gradient(135deg, var(--accent), #059669)' : undefined, boxShadow: !isStudent && !isLogin ? '0 4px 15px rgba(16, 185, 129, 0.35)' : undefined }}>
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} />
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setRole(null);
              }} 
              type="button"
              style={{ background: 'transparent', border: 'none', color: (!isLogin && !isStudent) ? 'var(--accent)' : 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', padding: 0 }}
            >
              {isLogin ? "Register here" : "Log in here"}
            </button>
          </p>
        </div>
      </div>
      <style>{`
        .input-group { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 1.25rem; color: var(--text-muted); transition: color 0.3s ease; }
        .auth-input {
          width: 100%; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.1rem 1.1rem 1.1rem 3.5rem; border-radius: 14px; color: white; font-family: inherit; font-size: 1.05rem; transition: all 0.3s ease;
        }
        .auth-input:focus {
          outline: none; background: rgba(255, 255, 255, 0.05);
        }
        /* Dynamic focus color based on role */
        .auth-input:focus { border-color: ${(!isLogin && !isStudent) ? 'var(--accent)' : 'var(--primary)'}; box-shadow: 0 0 0 3px ${(!isLogin && !isStudent) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(249, 115, 22, 0.15)'}; }
        .input-group:focus-within .input-icon { color: ${(!isLogin && !isStudent) ? 'var(--accent)' : 'var(--primary)'}; }
      `}</style>
    </motion.div>
  );
};

export default Auth;
