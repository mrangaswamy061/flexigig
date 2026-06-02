import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, BookOpen, Star, Settings, FileText, Loader, CheckCircle, Shield, MapPin, Camera, User } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Profile = ({ userData, onUpdateProfile }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ title: '', employerName: '', rating: '5', comment: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showPreferences, setShowPreferences] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/profile`)
      .then(res => res.json())
      .then(data => {
        const mergedProfile = {
          ...data,
          name: userData?.name || data.name,
          major: userData?.major || data.major,
          profilePic: userData?.profilePic || data.profilePic || null,
          contact: userData?.contact || data.contact,
          location: userData?.location || data.location,
        };
        setProfile(mergedProfile);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile from backend:", err);
        // Fallback
        const mockProfile = {
          name: userData?.name || 'Alex Johnson',
          major: userData?.major || 'Computer Science, Jr.',
          location: userData?.location || 'North Campus Dorms, Block B',
          contact: userData?.contact || '123-456-7890',
          rating: 4.9,
          reviewsCount: 24,
          about: userData?.about || "Passionate computer science student looking for frontend development and IT support gigs.",
          profilePic: userData?.profilePic || null,
          skills: userData?.skills?.length ? userData.skills.map(s => ({ name: s, endorsements: 0 })) : [
            { name: 'React.js', endorsements: 18 }
          ],
          reviews: []
        };
        setProfile(mockProfile);
        setLoading(false);
      });
  }, [userData]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.updatedProfile);
        setShowReviewForm(false);
        setNewReview({ title: '', employerName: '', rating: '5', comment: '' });
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    }
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPic = reader.result;
        setProfile(prev => ({ ...prev, profilePic: newPic }));
        if (onUpdateProfile) {
          onUpdateProfile({ profilePic: newPic });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading || !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader className="lucide-spin" size={48} color="var(--primary)" />
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .lucide-spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--accent)' }}>
            <Shield size={24} />
          </div>

          {/* Profile Picture with Edit */}
          <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 2rem' }}>
            <div style={{ 
              width: '140px', 
              height: '140px', 
              borderRadius: '50%', 
              background: profile.profilePic ? 'none' : 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(212, 175, 55, 0.3))',
              backgroundImage: profile.profilePic ? `url(${profile.profilePic})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '4px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 10px 30px rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {!profile.profilePic && <User size={56} color="rgba(255,255,255,0.4)" />}
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePicChange} style={{ display: 'none' }} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                position: 'absolute', bottom: '4px', right: '4px', 
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', 
                border: '3px solid var(--bg-dark)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.5)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Camera size={16} color="white" />
            </button>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>{profile.name}</h2>
          <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{profile.major}</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            <MapPin size={16} /> {profile.location}
          </div>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '0.5rem 1rem', borderRadius: '999px', marginBottom: '1rem' }}>
            <Star size={18} fill="#fbbf24" />
            <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{profile.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>({profile.reviewsCount} reviews)</span>
          </div>
          
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={() => {
              setEditData({ name: profile.name, major: profile.major, location: profile.location, about: profile.about });
              setIsEditing(true);
            }} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Edit Profile</button>
            <button onClick={() => setShowPreferences(true)} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
              <Settings size={20} /> Preferences
            </button>
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
                className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', border: '1px solid var(--primary)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
              >
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' }}>Edit Profile</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Full Name" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', width: '100%' }} />
                  <input type="text" value={editData.major} onChange={e => setEditData({...editData, major: e.target.value})} placeholder="Major / Degree" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', width: '100%' }} />
                  <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} placeholder="Location" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', width: '100%' }} />
                  <textarea value={editData.about} onChange={e => setEditData({...editData, about: e.target.value})} placeholder="About Me" rows={4} style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', width: '100%', resize: 'vertical' }} />
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={() => {
                      setProfile({ ...profile, ...editData });
                      if (onUpdateProfile) onUpdateProfile(editData);
                      setIsEditing(false);
                    }} className="btn-primary" style={{ flex: 1 }}>Save Changes</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showPreferences && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', border: '1px solid var(--accent)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
              >
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' }}>Preferences</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Email Notifications</span>
                    <input type="checkbox" defaultChecked style={{ transform: 'scale(1.5)', cursor: 'pointer' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>SMS Alerts</span>
                    <input type="checkbox" style={{ transform: 'scale(1.5)', cursor: 'pointer' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Profile Visibility</span>
                    <select style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }}>
                      <option value="public">Public (Employers can find me)</option>
                      <option value="private">Private (Only when I apply)</option>
                    </select>
                  </div>
                  <button onClick={() => setShowPreferences(false)} className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.8rem' }}>Save Preferences</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}><User size={20} /></div> Contact Info
          </h3>
          <div style={{ borderLeft: '2px solid rgba(212, 175, 55, 0.3)', paddingLeft: '1.5rem', marginLeft: '0.75rem' }}>
            <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>Phone</h4>
            <p style={{ color: '#e4e4e7', fontSize: '1rem', fontWeight: '500', marginBottom: '1.25rem' }}>{profile.contact || 'Not provided'}</p>
            <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>Address</h4>
            <p style={{ color: '#e4e4e7', fontSize: '1rem', fontWeight: '500' }}>{profile.location || 'Not provided'}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.25rem', letterSpacing: '-0.5px' }}>About Me</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            {profile.about}
          </p>
        </div>



        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Recent Reviews</h3>
            <div>
              <button onClick={() => setShowReviewForm(!showReviewForm)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', marginRight: '1rem' }}>
                {showReviewForm ? 'Cancel' : 'Add Review'}
              </button>
              <button style={{ color: 'var(--primary)', background: 'transparent', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                View All
              </button>
            </div>
          </div>
          
          {showReviewForm && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={submitReview}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}
            >
              <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Write a Review</h4>
              <input type="text" placeholder="Task Title" required value={newReview.title} onChange={e => setNewReview({...newReview, title: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
              <input type="text" placeholder="Employer/Company Name" required value={newReview.employerName} onChange={e => setNewReview({...newReview, employerName: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontSize: '0.95rem' }}>Rating:</label>
                <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: e.target.value})} style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <textarea placeholder="Your Comment" required rows={3} value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)', resize: 'vertical' }} />
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.75rem 1.5rem' }}>Submit Review</button>
            </motion.form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {profile.reviews && profile.reviews.length > 0 ? profile.reviews.map((rev, idx) => (
              <div key={rev.id || idx} style={{ borderBottom: idx !== profile.reviews.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: idx !== profile.reviews.length - 1 ? '2rem' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{rev.title}</h4>
                  <div style={{ display: 'flex', color: '#fbbf24', gap: '0.1rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < rev.rating ? "#fbbf24" : "none"} color={i < rev.rating ? "#fbbf24" : "var(--border-color)"} />
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '0.75rem' }}>
                  {rev.employerName}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reviews yet.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .lucide-spin { animation: spin 1s linear infinite; }
      `}</style>
    </motion.div>
  );
};

export default Profile;
