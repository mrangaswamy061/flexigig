import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, IndianRupee, Clock, Loader, Bookmark, Building2, Navigation, Map, X, CheckCircle } from 'lucide-react';
import RealMap from './RealMap';

const Jobs = ({ userProfile, appliedJobs, setAppliedJobs, globalJobs, applications = [], setApplications }) => {
  const studentLocation = userProfile?.location || 'Campus Center';
  const [searchTerm, setSearchTerm] = useState('');
  const [radiusFilter, setRadiusFilter] = useState(5); // Default 5 km
  const [skillFilter, setSkillFilter] = useState('All');
  const [employerFilter, setEmployerFilter] = useState('All'); 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMapJob, setSelectedMapJob] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const appliedJobObj = jobs.find(j => appliedJobs.includes(j.id));

  useEffect(() => {
    if (globalJobs && globalJobs.length > 0) {
      setJobs(globalJobs);
      setLoading(false);
    }
  }, [globalJobs]);


  const filteredJobs = jobs.filter(j => {
    const tags = j.tags || [];
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) || j.dept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRadius = (j.distance ?? 0) <= radiusFilter;
    const matchesSkill = skillFilter === 'All' || j.skillLevel === skillFilter;
    const matchesEmployer = employerFilter === 'All' || j.employerType === employerFilter;
    
    return matchesSearch && matchesRadius && matchesSkill && matchesEmployer;
  });

  const handleDirections = (destination) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, '_blank', 'noopener,noreferrer');
  };

  const handleOneClickApply = (id) => {
    if (!appliedJobs.includes(id)) {
      setAppliedJobs([...appliedJobs, id]);
      if (setApplications) {
        setApplications(prev => [...prev, {
          jobId: id,
          studentEmail: userProfile?.email,
          studentName: userProfile?.name || 'Student',
          studentCollege: userProfile?.college || 'University',
          studentMajor: userProfile?.major || 'General',
          studentRating: 4.5,
          appliedAt: new Date().toLocaleTimeString(),
          studentLoc: [28.6139 + (Math.random()-0.5)*0.02, 77.2090 + (Math.random()-0.5)*0.02]
        }]);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'relative' }}
    >
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Find Gigs</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '300' }}>Discover flexible campus and local business opportunities near you.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Gig Type Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.35rem', borderRadius: '12px' }}>
            <button 
              onClick={() => setEmployerFilter('All')} 
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '8px', 
                background: employerFilter === 'All' ? 'rgba(255,255,255,0.15)' : 'transparent', 
                color: employerFilter === 'All' ? 'white' : 'var(--text-muted)', 
                fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
              }}
            >
              All Gigs
            </button>
            <button 
              onClick={() => setEmployerFilter('Local Business')} 
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '8px', 
                background: employerFilter === 'Local Business' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', 
                color: employerFilter === 'Local Business' ? '#10b981' : 'var(--text-muted)', 
                fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
              }}
            >
              Local Businesses Only
            </button>
          </div>

          {/* Map Visibility Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.35rem', borderRadius: '12px' }}>
            <button 
              onClick={() => setShowMap(true)} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '8px', 
                background: showMap ? 'rgba(96, 165, 250, 0.2)' : 'transparent', 
                color: showMap ? '#60a5fa' : 'var(--text-muted)', 
                fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
              }}
            >
              <Map size={16} /> Show Map
            </button>
            <button 
              onClick={() => setShowMap(false)} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '8px', 
                background: !showMap ? 'rgba(244, 63, 94, 0.2)' : 'transparent', 
                color: !showMap ? '#f43f5e' : 'var(--text-muted)', 
                fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
              }}
            >
              <X size={16} /> Hide Map
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '0.75rem 1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)' }} className="search-container">
          <Search size={20} color="var(--primary)" style={{ marginRight: '0.75rem' }} />
          <input type="text" placeholder="Search roles, skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1.05rem', fontFamily: 'inherit' }} />
        </div>
        
        <div style={{ flex: '0 1 auto', display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '0.75rem 1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)' }} className="search-container">
          <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1.05rem', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none' }}>
            <option value="All" style={{ color: 'black' }}>All Skills</option>
            <option value="Unskilled" style={{ color: 'black' }}>Unskilled (No Exp.)</option>
            <option value="Skilled" style={{ color: 'black' }}>Skilled (Requires Exp.)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '0.75rem 1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', minWidth: '250px', flex: '1 1 auto' }} className="search-container">
          <Navigation size={20} color="#fbbf24" style={{ marginRight: '0.75rem' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: '500' }}>
              <span>Gigs within {radiusFilter} km of <strong style={{ color: 'white' }}>{studentLocation}</strong></span>
              <span>{radiusFilter >= 20 ? 'Max' : ''}</span>
            </div>
            <input type="range" min="1" max="20" step="1" value={radiusFilter} onChange={(e) => setRadiusFilter(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <Loader className="lucide-spin" size={48} color="var(--primary)" />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', width: '100%' }}>
          
          {/* Left Column: Job Feed */}
          <div 
            style={{ 
              flex: showMap ? '1 1 55%' : '1 1 100%', 
              width: showMap ? '55%' : '100%',
              transition: 'flex 0.5s cubic-bezier(0.22, 1, 0.36, 1), width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
              display: 'grid', 
              gridTemplateColumns: showMap ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'repeat(auto-fill, minmax(340px, 1fr))', 
              gap: '1.5rem', 
              alignContent: 'flex-start', 
              maxHeight: 'calc(100vh - 200px)', 
              overflowY: 'auto', 
              paddingRight: '0.5rem' 
            }} 
            className="custom-scrollbar"
          >
            {filteredJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                No gigs found matching your criteria. Try expanding your search radius.
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <motion.div 
                  key={job.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="glass-panel card-hover" 
                  style={{ 
                    padding: '1.5rem', display: 'flex', flexDirection: 'column',
                    border: selectedMapJob?.id === job.id ? '1px solid rgba(16, 185, 129, 0.6)' : undefined,
                    boxShadow: selectedMapJob?.id === job.id ? '0 0 20px rgba(16, 185, 129, 0.15)' : undefined
                  }}
                  onMouseEnter={() => setSelectedMapJob(job)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.3rem', lineHeight: '1.2' }}>{job.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {job.employerType === 'Local Business' ? <Building2 size={14} /> : <MapPin size={14} />}
                        {job.dept}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                      <div style={{ 
                        background: job.employerType === 'Local Business' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(249, 115, 22, 0.15)', 
                        color: job.employerType === 'Local Business' ? '#10b981' : '#f97316', 
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700',
                        border: `1px solid ${job.employerType === 'Local Business' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(249, 115, 22, 0.3)'}`
                      }}>
                        {job.employerType}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e4e4e7', fontSize: '0.85rem', fontWeight: '500' }}>
                      <Navigation size={14} color="var(--accent)" /> {job.distance === 0 ? 'Remote' : `${job.distance} km away`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e4e4e7', fontSize: '0.85rem', fontWeight: '500' }}>
                      <MapPin size={14} color="var(--accent)" /> {job.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e4e4e7', fontSize: '0.85rem', fontWeight: '500' }}>
                      <IndianRupee size={14} color="var(--accent)" /> {job.pay}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {job.skillLevel === 'Unskilled' && (
                      <span style={{ fontSize: '0.75rem', color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                        No Exp. Needed
                      </span>
                    )}
                    {job.tags.map((tag, idx) => (
                      <span key={`${tag}-${idx}`} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={() => handleOneClickApply(job.id)}
                      className="btn-primary" 
                      style={{ flex: 1, padding: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', background: appliedJobs.includes(job.id) ? 'transparent' : undefined, border: appliedJobs.includes(job.id) ? '1px solid #10b981' : undefined, color: appliedJobs.includes(job.id) ? '#10b981' : undefined }}
                    >
                      {appliedJobs.includes(job.id) ? <><CheckCircle size={16} /> Applied</> : '1-Click Apply'}
                    </button>
                    {job.distance > 0 && (
                      <button 
                        onClick={() => handleDirections(job.location)}
                        className="btn-secondary card-hover" 
                        style={{ padding: '0.7rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                      >
                        <Map size={16} color="#60a5fa" />
                      </button>
                    )}
                    <button className="btn-secondary card-hover" style={{ padding: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                      <Bookmark size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Right Column: Real Map */}
          <AnimatePresence>
            {showMap && (
              <motion.div 
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ flex: '1 1 45%', position: 'sticky', top: '2rem' }}
              >
                <div className="glass-panel" style={{ width: '100%', height: 'calc(100vh - 250px)', minHeight: '600px', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(8px)', padding: '0.5rem 1rem', borderRadius: '10px', zIndex: 1000, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
                    <h4 style={{ fontSize: '0.9rem', color: '#e4e4e7', fontWeight: '600' }}>Live Radar Map</h4>
                  </div>

                  <button 
                    onClick={() => setShowMap(false)}
                    title="Hide Map"
                    style={{ 
                      position: 'absolute', 
                      top: '1rem', 
                      right: '1rem', 
                      background: 'rgba(5, 5, 5, 0.8)', 
                      backdropFilter: 'blur(8px)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 1000,
                      color: '#a1a1aa',
                      transition: 'all 0.2s'
                    }}
                    className="card-hover"
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    <X size={16} />
                  </button>

                  <RealMap 
                    jobs={filteredJobs} 
                    center={[28.6139, 77.2090]} 
                    selectedJob={selectedMapJob} 
                    appliedJob={appliedJobObj}
                    userRole="student"
                  />

                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .lucide-spin { animation: spin 1s linear infinite; }
        .search-container:focus-within {
          border-color: rgba(249, 115, 22, 0.5) !important;
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.1) !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .mock-map {
          background: 
            radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 60%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 100% 100%, 30px 30px, 30px 30px;
          background-color: #030303;
        }
      `}</style>
    </motion.div>
  );
};

export default Jobs;
