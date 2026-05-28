import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, FileText, CheckCircle, Search, Star, MapPin, Clock, IndianRupee, ArrowUpRight, ShieldAlert, GraduationCap, Filter, Eye, Building2 } from 'lucide-react';
import RealMap from './RealMap';
import { API_BASE_URL } from '../config';



const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: `4px solid ${color}` }}>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{label}</p>
      <h3 style={{ fontSize: '2rem', fontWeight: '800' }}>{value}</h3>
      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700' }}><ArrowUpRight size={12} style={{ display: 'inline' }} /> {trend}</span>
    </div>
    <div style={{ background: `${color}20`, padding: '0.75rem', borderRadius: '12px' }}>
      <Icon size={24} color={color} />
    </div>
  </div>
);

const Stars = ({ rating }) => (
  <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.9rem' }}>{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))} {rating}</span>
);

const Badge = ({ label, color }) => (
  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', background: `${color}20`, color }}>{label}</span>
);

const AdminDashboard = ({ goHome, globalJobs = [], setGlobalJobs, students = [], setStudents, employers = [], setEmployers, applications = [], setApplications }) => {
  const [tab, setTab] = useState('Overview');
  const [search, setSearch] = useState('');

  // Dynamically generate recent activity from actual data
  const recentActivities = [];

  // Add applications
  applications.slice(-3).forEach(app => {
    const job = globalJobs.find(j => j.id === app.jobId);
    recentActivities.push({
      icon: FileText,
      color: '#10b981',
      title: `${app.studentName || 'Student'} applied`,
      sub: `${job ? job.title : 'a gig'} @ ${job ? job.dept : 'Business'}`,
      time: app.appliedAt || 'Just now',
      timestamp: app.createdAt ? new Date(app.createdAt).getTime() : Date.now() - 600000
    });
  });

  // Add posted jobs
  globalJobs.slice(-3).forEach(job => {
    recentActivities.push({
      icon: Building2,
      color: '#8b5cf6',
      title: `${job.dept || 'Employer'} posted a new gig`,
      sub: `${job.title} • ${job.pay}`,
      time: 'New gig',
      timestamp: job.createdAt ? new Date(job.createdAt).getTime() : Date.now() - 1200000
    });
  });

  // Add students who have logged in or are active
  students.slice(-2).forEach(s => {
    recentActivities.push({
      icon: GraduationCap,
      color: '#3b82f6',
      title: `${s.name} joined as Student`,
      sub: `${s.college} • ${s.major}`,
      time: 'Active',
      timestamp: Date.now() - 1800000
    });
  });

  // Sort them if timestamps are available
  recentActivities.sort((a, b) => b.timestamp - a.timestamp);

  // Fallback if empty
  if (recentActivities.length === 0) {
    recentActivities.push({
      icon: CheckCircle,
      color: '#10b981',
      title: 'Platform fully operational',
      sub: 'All systems green, no recent actions',
      time: 'Now',
      timestamp: Date.now()
    });
  }

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

  const tabs = ['Overview', 'Students', 'Employers', 'Jobs & Applications'];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.college.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEmployers = employers.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8C42)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '0.3rem', borderRadius: '10px' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} onError={e => { e.target.style.display='none'; }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white' }}>Admin Portal</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>FlexiGig Platform Management</p>
          </div>
        </div>
        <button onClick={goHome} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '0.5rem 1.2rem', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Search */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.75rem' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students, employers, jobs..." style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 1.25rem', borderRadius: '12px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
            <Filter size={18} /> Filter
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard label="Total Students" value={students.length} icon={GraduationCap} color="#3b82f6" trend="+12% this month" />
          <StatCard label="Employers" value={employers.length} icon={Building2} color="#8b5cf6" trend="+5% this month" />
          <StatCard label="Active Gigs" value={globalJobs.length} icon={CheckCircle} color="#10b981" trend="+18% this week" />
          <StatCard label="Total Applications" value={applications.length} icon={FileText} color="#f97316" trend="+24% this week" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '0.55rem 1.25rem', borderRadius: '999px', fontSize: '0.95rem', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.25s', background: tab === t ? 'linear-gradient(135deg, #FF4D6D, #FF8C42)' : 'transparent', color: tab === t ? 'white' : 'var(--text-muted)' }}>
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {tab === 'Overview' && (
            <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} color="#FF8C42" /> Live Job Map
                </h3>
                <div style={{ height: '380px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <RealMap jobs={globalJobs} center={[28.6139, 77.2090]} userRole="admin" />
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>Recent Activity</h3>
                {recentActivities.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ background: `${a.color}20`, padding: '0.6rem', borderRadius: '10px' }}><Icon size={18} color={a.color} /></div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.15rem' }}>{a.title}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{a.sub}</p>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{a.time}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STUDENTS */}
          {tab === 'Students' && (
            <motion.div key="st" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {filteredStudents.map(s => {
                  const appliedGigTitles = s.appliedJobs.map(id => globalJobs.find(j => j.id === id)?.title || `Job #${id}`);
                  return (
                    <div key={s.id} className="glass-panel" style={{ padding: '1.75rem', borderLeft: s.status === 'Active' ? '4px solid #10b981' : '4px solid #6b7280' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem' }}>{s.avatar}</div>
                          <div>
                            <h4 style={{ fontWeight: '700', fontSize: '1.05rem' }}>{s.name}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.college}</p>
                          </div>
                        </div>
                        <Badge label={s.status} color={s.status === 'Active' ? '#10b981' : s.status === 'Warned' ? '#f59e0b' : '#ef4444'} />
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{s.major}</p>
                      <Stars rating={s.rating} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', margin: '1rem 0', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#3b82f6' }}>{s.completedGigs}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gigs Done</p>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                          <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>{s.earnings}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Earned</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f59e0b' }}>{s.rating}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rating</p>
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Applied Jobs:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                          {appliedGigTitles.map((t, i) => <Badge key={i} label={t} color="#f97316" />)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <button 
                          disabled={s.status === 'Warned' || s.status === 'Blocked'}
                          onClick={() => setStudents(students.map(st => st.id === s.id ? { ...st, status: 'Warned' } : st))} 
                          style={{ flex: 1, background: s.status === 'Warned' || s.status === 'Blocked' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(245, 158, 11, 0.15)', color: s.status === 'Warned' || s.status === 'Blocked' ? 'gray' : '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.6rem', borderRadius: '8px', fontWeight: '600', cursor: s.status === 'Warned' || s.status === 'Blocked' ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}
                        >
                          {s.status === 'Warned' ? 'Warned (1/1)' : 'Give Warning'}
                        </button>
                        <button 
                          disabled={s.status === 'Blocked'}
                          onClick={() => setStudents(students.map(st => st.id === s.id ? { ...st, status: 'Blocked' } : st))} 
                          style={{ flex: 1, background: s.status === 'Blocked' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(239, 68, 68, 0.15)', color: s.status === 'Blocked' ? 'gray' : '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.6rem', borderRadius: '8px', fontWeight: '600', cursor: s.status === 'Blocked' ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}
                        >
                          {s.status === 'Blocked' ? 'Blocked' : 'Block Profile'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* EMPLOYERS */}
          {tab === 'Employers' && (
            <motion.div key="em" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {filteredEmployers.map(e => {
                  const postedTitles = e.postedJobs.map(id => globalJobs.find(j => j.id === id)?.title || `Job #${id}`);
                  const appliedStudents = students.filter(s => s.appliedJobs.some(jid => e.postedJobs.includes(jid)));
                  return (
                    <div key={e.id} className="glass-panel" style={{ padding: '1.75rem', borderLeft: e.status === 'Flagged' ? '4px solid #ef4444' : '4px solid #8b5cf6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={24} color="white" />
                          </div>
                          <div>
                            <h4 style={{ fontWeight: '700', fontSize: '1.05rem' }}>{e.name}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{e.type}</p>
                          </div>
                        </div>
                        <Badge label={e.status} color={e.status === 'Active' ? '#10b981' : e.status === 'Warned' ? '#f59e0b' : '#ef4444'} />
                      </div>
                      <Stars rating={e.rating} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '1rem 0', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#8b5cf6' }}>{e.postedJobs.length}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Posted Jobs</p>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>{e.totalHired}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Hired</p>
                        </div>
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Posted Gigs:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {postedTitles.map((t, i) => <Badge key={i} label={t} color="#8b5cf6" />)}
                        </div>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Applicants:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {appliedStudents.length ? appliedStudents.map(s => <Badge key={s.id} label={s.name} color="#3b82f6" />) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No applicants yet</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <button 
                          disabled={e.status === 'Warned' || e.status === 'Blocked'}
                          onClick={() => setEmployers(employers.map(emp => emp.id === e.id ? { ...emp, status: 'Warned' } : emp))} 
                          style={{ flex: 1, background: e.status === 'Warned' || e.status === 'Blocked' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(245, 158, 11, 0.15)', color: e.status === 'Warned' || e.status === 'Blocked' ? 'gray' : '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.6rem', borderRadius: '8px', fontWeight: '600', cursor: e.status === 'Warned' || e.status === 'Blocked' ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}
                        >
                          {e.status === 'Warned' ? 'Warned (1/1)' : 'Give Warning'}
                        </button>
                        <button 
                          disabled={e.status === 'Blocked'}
                          onClick={() => setEmployers(employers.map(emp => emp.id === e.id ? { ...emp, status: 'Blocked' } : emp))} 
                          style={{ flex: 1, background: e.status === 'Blocked' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(239, 68, 68, 0.15)', color: e.status === 'Blocked' ? 'gray' : '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.6rem', borderRadius: '8px', fontWeight: '600', cursor: e.status === 'Blocked' ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}
                        >
                          {e.status === 'Blocked' ? 'Blocked' : 'Block Profile'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {tab === 'Jobs & Applications' && (
            <motion.div key="ja" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {globalJobs.map(job => {
                  const applicants = students.filter(s => s.appliedJobs.includes(job.id));
                  const employer = employers.find(e => e.postedJobs.includes(job.id));
                  return (
                    <div key={job.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <div style={{ flex: '1 1 250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Briefcase size={18} color="var(--primary)" />
                          <h4 style={{ fontWeight: '700', fontSize: '1.05rem' }}>{job.title}</h4>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>{job.dept} • {job.location}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}><IndianRupee size={14} />{job.pay}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}><Clock size={14} />{job.duration}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}><MapPin size={14} />{job.distance}km</span>
                        </div>
                      </div>
                      <div style={{ flex: '1 1 180px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'uppercase' }}>Posted By</p>
                        {employer ? (
                          <div>
                            <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{employer.name}</p>
                            <Stars rating={employer.rating} />
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Campus Job</span>
                        )}
                      </div>
                      <div style={{ flex: '1 1 220px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'uppercase' }}>Applicants ({applicants.length})</p>
                        {applicants.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {applicants.map(s => (
                              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
                                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{s.name}</span>
                                <Stars rating={s.rating} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No applicants</span>
                        )}
                      </div>
                      <div style={{ flex: '1 1 100px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleDeleteJob(job.id)} 
                          style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Delete Job
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
