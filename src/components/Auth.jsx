import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, Lock, ArrowRight, Building2, Briefcase, GraduationCap, MapPin, Eye, EyeOff, Zap, CheckCircle, Shield } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ─── Sub Components ──────────────────────────────────────────────────────────

const InputField = ({ icon: Icon, type, placeholder, inputRef, color = 'var(--primary)', required = true, isPassword = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Icon size={18} style={{ position: 'absolute', left: '1.1rem', color: 'var(--text-muted)', zIndex: 2, pointerEvents: 'none', transition: 'color 0.3s' }} />
      <input
        ref={inputRef}
        type={actualType}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '0.95rem 1rem 0.95rem 3.2rem',
          borderRadius: '12px',
          color: 'white',
          fontFamily: 'inherit',
          fontSize: '1rem',
          outline: 'none',
          transition: 'all 0.25s',
          paddingRight: isPassword ? '3rem' : '1rem',
        }}
        onFocus={e => {
          e.target.style.borderColor = color;
          e.target.style.background = 'rgba(255,255,255,0.06)';
          e.target.style.boxShadow = `0 0 0 3px ${color}25`;
          const icon = e.target.previousSibling;
          if (icon) icon.style.color = color;
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
          e.target.style.background = 'rgba(255,255,255,0.03)';
          e.target.style.boxShadow = 'none';
          const icon = e.target.previousSibling;
          if (icon) icon.style.color = 'var(--text-muted)';
        }}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          style={{
            position: 'absolute', right: '1rem', background: 'transparent', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center'
          }}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
};

// ─── Form for Login / Register ────────────────────────────────────────────────

const AuthForm = ({ tab, mode, setMode, onSuccess }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isUser = tab === 'user';
  const isLogin = mode === 'login';
  const accentColor = isUser ? 'var(--primary)' : 'var(--accent)';
  const accentRgb = isUser ? 'rgba(212,175,55,0.15)' : 'rgba(139,92,246,0.15)';
  const role = isUser ? 'student' : 'employer';

  // Refs for inputs
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const phoneRef = useRef();
  const locationRef = useRef();

  // Reset error when switching modes
  useEffect(() => { setError(''); }, [tab, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = emailRef.current?.value?.trim() || '';
    const password = passwordRef.current?.value || '';

    try {
      if (!isLogin) {
        // Registration
        const name = nameRef.current?.value?.trim() || email.split('@')[0];
        const contact = phoneRef.current?.value?.trim() || undefined;
        const locationVal = locationRef.current?.value?.trim() || undefined;

        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role, contact, location: locationVal })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        if (data.token) localStorage.setItem('token', data.token);
        login(data.user.role, false, data.user.name, email, data.user);
        onSuccess(data.user.role);
      } else {
        // Login
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        const actualRole = data.user?.role || role;
        if (data.token) localStorage.setItem('token', data.token);
        login(actualRole, false, data.user?.name || email.split('@')[0], email, data.user);
        onSuccess(actualRole);
      }
    } catch (err) {
      const isNetworkError = err instanceof TypeError || err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('network');
      if (isNetworkError) {
        // Offline fallback
        if (isLogin) {
          login(role, false, email.split('@')[0], email, { name: email.split('@')[0], email, role });
          onSuccess(role);
        } else {
          setError('⚠️ Server offline. Please try again later or use the app in offline mode.');
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const featureList = isUser
    ? ['Find flexible gigs near you', 'Apply with one click', 'Earn on your schedule']
    : ['Post gigs for your business', 'Access motivated workers', 'Manage applications easily'];

  return (
    <motion.div
      key={`${tab}-${mode}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.9rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '0.4rem' }}>
          {isLogin
            ? (isUser ? 'Welcome' : 'Business Portal')
            : (isUser ? 'Create your account' : 'Register your business')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {isLogin
            ? `Sign in to access your ${isUser ? 'gig dashboard' : 'business dashboard'}.`
            : (isUser ? 'Find local gigs and start earning today.' : 'Hire talented people from your community.')}
        </p>
      </div>

      {/* Feature pills — only on register mode */}
      {!isLogin && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {featureList.map((f, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              background: accentRgb, color: accentColor,
              padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '600',
              border: `1px solid ${accentColor}33`
            }}>
              <CheckCircle size={12} /> {f}
            </span>
          ))}
        </div>
      )}

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem',
              color: '#fca5a5', fontSize: '0.9rem', lineHeight: '1.4'
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence mode="popLayout">
          {!isLogin && (
            <motion.div
              key="register-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}
            >
              <InputField icon={User} type="text" placeholder="Full Name" inputRef={nameRef} color={accentColor} />
              <InputField icon={Phone} type="tel" placeholder="Phone Number" inputRef={phoneRef} color={accentColor} />
              <InputField
                icon={isUser ? MapPin : Building2}
                type="text"
                placeholder={isUser ? 'Your Location / Address' : 'Business Address'}
                inputRef={locationRef}
                color={accentColor}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <InputField icon={Mail} type="email" placeholder="Email Address" inputRef={emailRef} color={accentColor} />
        <InputField icon={Lock} type="password" placeholder="Password" inputRef={passwordRef} color={accentColor} isPassword />

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          style={{
            marginTop: '0.5rem',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem',
            padding: '1rem', fontSize: '1rem', fontWeight: '700', borderRadius: '12px',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: isUser
              ? 'linear-gradient(135deg, #d4af37, #f59e0b)'
              : 'linear-gradient(135deg, #8b5cf6, #4c1d95)',
            color: isUser ? '#1a1200' : 'white',
            boxShadow: isUser
              ? '0 4px 20px rgba(212,175,55,0.35)'
              : '0 4px 20px rgba(139,92,246,0.35)',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.25s',
          }}
        >
          {loading ? (
            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <>
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </form>

      {/* Toggle mode */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          {isLogin
            ? (isUser ? "Don't have a user account? " : "No business account yet? ")
            : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(isLogin ? 'register' : 'login')}
            style={{
              background: 'transparent', border: 'none',
              color: accentColor, cursor: 'pointer',
              fontWeight: '700', fontSize: '0.92rem', padding: 0,
              textDecoration: 'underline', textUnderlineOffset: '3px'
            }}
          >
            {isLogin
              ? (isUser ? 'Create User Account' : 'Create Business Account')
              : 'Sign In Instead'}
          </button>
        </p>
      </div>
    </motion.div>
  );
};

// ─── Main Auth Page ───────────────────────────────────────────────────────────

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state from URL; default to user+login
  const tab = searchParams.get('tab') === 'business' ? 'business' : 'user';
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const setTab = (newTab) => setSearchParams({ tab: newTab, mode }, { replace: true });
  const setMode = (newMode) => setSearchParams({ tab, mode: newMode }, { replace: true });

  const handleSuccess = (role) => {
    if (role === 'employer') navigate('/business/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/user/dashboard');
  };

  const isUser = tab === 'user';
  const primaryColor = isUser ? 'var(--primary)' : 'var(--accent)';
  const glowColor = isUser ? 'rgba(212,175,55,0.12)' : 'rgba(139,92,246,0.12)';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background glows */}
      <div style={{
        position: 'fixed', top: '-15%', left: '-10%',
        width: '500px', height: '500px',
        background: `radial-gradient(circle, ${isUser ? 'rgba(212,175,55,0.1)' : 'rgba(139,92,246,0.1)'}, transparent 65%)`,
        pointerEvents: 'none', transition: 'background 0.5s'
      }} />
      <div style={{
        position: 'fixed', bottom: '-15%', right: '-10%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 65%)',
        pointerEvents: 'none'
      }} />

      {/* Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          maxWidth: '480px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/logo.png" alt="FlexiGig" style={{ height: '56px', objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none'; }} />
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '5px',
          marginBottom: '1.5rem',
          gap: '4px',
          position: 'relative',
        }}>
          {[
            { key: 'user', label: 'User Login', icon: GraduationCap, color: 'var(--primary)', bg: 'rgba(212,175,55,0.15)', shadow: 'rgba(212,175,55,0.3)' },
            { key: 'business', label: 'Business Owner Login', icon: Briefcase, color: 'var(--accent)', bg: 'rgba(139,92,246,0.15)', shadow: 'rgba(139,92,246,0.3)' },
          ].map(({ key, label, icon: Icon, color, bg, shadow }) => {
            const isActive = tab === key;
            return (
              <button
                key={key}
                id={`auth-tab-${key}`}
                onClick={() => setTab(key)}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                  background: isActive ? bg : 'transparent',
                  color: isActive ? color : 'var(--text-muted)',
                  boxShadow: isActive ? `0 4px 16px ${shadow}` : 'none',
                  position: 'relative',
                }}
              >
                <Icon size={16} />
                <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '24px',
                      height: '3px',
                      background: color,
                      borderRadius: '99px',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Form Card */}
        <div
          className="glass-panel"
          style={{
            padding: '2.25rem 2rem',
            borderRadius: '20px',
            border: `1px solid ${isUser ? 'rgba(212,175,55,0.15)' : 'rgba(139,92,246,0.15)'}`,
            background: `linear-gradient(160deg, ${glowColor}, rgba(10,10,15,0.8))`,
            transition: 'border-color 0.4s, background 0.4s',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle glow inside card */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '160px', height: '160px',
            background: isUser
              ? 'radial-gradient(circle, rgba(212,175,55,0.12), transparent 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
            pointerEvents: 'none',
            transition: 'background 0.4s',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <AnimatePresence mode="wait">
              <AuthForm
                key={tab}
                tab={tab}
                mode={mode}
                setMode={setMode}
                onSuccess={handleSuccess}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '1.5rem',
          marginTop: '1.25rem', flexWrap: 'wrap'
        }}>
          {[
            { icon: Shield, text: 'Secure & Encrypted' },
            { icon: Zap, text: 'Instant Access' },
            { icon: CheckCircle, text: 'Verified Platform' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '500'
            }}>
              <Icon size={13} color={primaryColor} />
              {text}
            </div>
          ))}
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Auth;
