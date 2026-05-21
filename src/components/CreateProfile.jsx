import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Camera } from 'lucide-react';

const CreateProfile = ({ role, onComplete, goHome }) => {
  const [profilePic, setProfilePic] = useState('https://i.pravatar.cc/300?img=32');

  const handlePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfilePic(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profileData = {
      profilePic,
      major: formData.get('major'),
      gradYear: formData.get('gradYear'),
      about: formData.get('about'),
      location: formData.get('location'),
      businessType: formData.get('businessType'),
      website: formData.get('website'),
      address: formData.get('address')
    };
    onComplete(profileData);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '650px', padding: '3.5rem' }}
      >
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-0.5px' }}>
          Complete Your Profile
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
          This step is mandatory before you can {role === 'student' ? 'apply for gigs' : 'post gigs'}.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-dark)', 
              backgroundImage: `url(${profilePic})`, backgroundSize: 'cover', backgroundPosition: 'center',
              border: '4px solid rgba(255,255,255,0.1)', position: 'relative', marginBottom: '1rem'
            }}>
              <label style={{ 
                position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--primary)', 
                color: 'black', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(249, 115, 22, 0.4)'
              }}>
                <Camera size={18} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePicChange} />
              </label>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload Profile Picture</p>
          </div>

          {role === 'student' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <input name="major" type="text" placeholder="Your Major (e.g., Computer Science)" required className="profile-input" />
                <input name="gradYear" type="text" placeholder="Expected Graduation (e.g., 2026)" required className="profile-input" />
              </div>
              <textarea name="about" placeholder="Write a short bio about yourself, your goals, and what you're looking for..." required className="profile-input" style={{ minHeight: '140px', resize: 'vertical' }}></textarea>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <MapPin color="var(--primary)" size={20} />
                <input name="location" type="text" placeholder="Your specific campus location (e.g., North Dorms)" required style={{ border: 'none', background: 'transparent', padding: 0, flex: 1, color: 'white', outline: 'none', fontSize: '1.05rem', fontFamily: 'inherit' }} />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <input name="businessType" type="text" placeholder="Business Type (e.g., Retail, Cafe, Agency)" required className="profile-input" />
                <input name="website" type="url" placeholder="Website URL (optional)" className="profile-input" />
              </div>
              <textarea name="about" placeholder="Briefly describe your business and what kind of students you're looking to hire..." required className="profile-input" style={{ minHeight: '140px', resize: 'vertical' }}></textarea>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <MapPin color="var(--accent)" size={20} />
                <input name="address" type="text" placeholder="Exact Business Address" required style={{ border: 'none', background: 'transparent', padding: 0, flex: 1, color: 'white', outline: 'none', fontSize: '1.05rem', fontFamily: 'inherit' }} />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem', padding: '1.25rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: role === 'employer' ? 'linear-gradient(135deg, var(--accent), #059669)' : undefined, boxShadow: role === 'employer' ? '0 4px 15px rgba(16, 185, 129, 0.35)' : undefined }}>
            <CheckCircle size={22} /> Save & Enter Platform
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span 
            onClick={goHome} 
            style={{ color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ← Back to Home
          </span>
        </div>
      </motion.div>
      <style>{`
        .profile-input {
          width: 100%; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.1rem; border-radius: 12px; color: white; font-family: inherit; font-size: 1.05rem; transition: all 0.3s ease;
        }
        .profile-input:focus {
          outline: none; background: rgba(255, 255, 255, 0.05);
          border-color: ${role === 'student' ? 'var(--primary)' : 'var(--accent)'};
          box-shadow: 0 0 0 3px ${role === 'student' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)'};
        }
      `}</style>
    </div>
  );
};

export default CreateProfile;
