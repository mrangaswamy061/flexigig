import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, ChevronRight, IndianRupee, Loader, Star, ArrowUpRight, MapPin } from 'lucide-react';

const Dashboard = ({ onNavigate, appliedJobs = [], userProfile, globalJobs = [] }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Compute dynamic data from student activity
    const appliedGigDetails = globalJobs.filter(j => appliedJobs.includes(j.id));
    const totalEarned = appliedGigDetails.reduce((sum, job) => {
      const payMatch = job.pay?.match(/(\d+)/);
      return sum + (payMatch ? parseInt(payMatch[1]) * 10 : 0);
    }, 0);
    const totalHours = appliedGigDetails.reduce((sum, job) => {
      const hourMatch = job.duration?.match(/(\d+)/);
      return sum + (hourMatch ? parseInt(hourMatch[1]) : 4);
    }, 0);

    const mockData = {
      activeGigs: appliedJobs.length,
      completedGigs: Math.max(0, appliedJobs.length - 1),
      earnedThisMonth: totalEarned || 0,
      hoursTracked: totalHours || 0,
      studentName: userProfile?.name?.split(' ')[0] || 'Alex',
      studentLocation: userProfile?.location || 'North Campus Dorms, Block B',
      recentGigs: appliedGigDetails.length > 0 ? appliedGigDetails.slice(0, 3).map(g => ({
        id: g.id, title: g.title, company: g.dept, status: 'In Progress', 
        deadline: 'This Week', type: g.type || 'In Person', location: g.location
      })) : [
        { id: 1, title: 'No gigs yet — apply now!', company: 'Go to Find Gigs', status: 'Pending', deadline: 'Today', type: 'Start', location: 'Explore' }
      ]
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 400);
  }, [appliedJobs, globalJobs, userProfile]);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader className="lucide-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  const stats = [
    { label: 'Active Gigs', value: data.activeGigs, icon: TrendingUp, color: '#10b981' },
    { label: 'Completed', value: data.completedGigs, icon: CheckCircle, color: '#3b82f6' },
    { label: 'Earned This Month', value: `₹${data.earnedThisMonth.toLocaleString('en-IN')}`, icon: IndianRupee, color: '#fbbf24' },
    { label: 'Hours Tracked', value: `${data.hoursTracked}h`, icon: Clock, color: '#8b5cf6' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1rem' }}
          >
            <Star size={14} fill="currentColor" /> Top Rated Student
          </motion.div>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-1px', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome back, {data.studentName}!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '300', marginBottom: '0.5rem' }}>Here's what's happening with your campus gigs today.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>
            <MapPin size={18} color="var(--primary)" /> Based in: <span style={{ color: '#e4e4e7' }}>{data.studentLocation}</span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('jobs')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Find New Gigs <ArrowUpRight size={20} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 100 }}
              className="glass-panel card-hover" 
              style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
            >
              <div style={{ 
                background: `linear-gradient(135deg, ${stat.color}22, ${stat.color}11)`, 
                padding: '1.25rem', 
                borderRadius: '16px',
                color: stat.color,
                border: `1px solid ${stat.color}33`,
                boxShadow: `0 8px 20px ${stat.color}15`
              }}>
                <Icon size={28} strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '0.25rem', fontWeight: '500' }}>{stat.label}</p>
                <h3 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', lineHeight: '1' }}>{stat.value}</h3>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', flex: '2 1 600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Current Gigs</h3>
            <button 
              onClick={() => onNavigate('jobs')} 
              style={{ color: 'var(--primary)', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
            >
              View All <ChevronRight size={18} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {data.recentGigs.map((gig, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.4 }}
                key={gig.id} className="card-hover" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{gig.title}</h4>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e4e4e7' }}>{gig.type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{gig.company}</p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent)', fontSize: '0.85rem' }}><MapPin size={14} /> {gig.location}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '0.35rem 1rem',
                    background: gig.status === 'In Progress' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: gig.status === 'In Progress' ? '#f97316' : '#10b981',
                    border: `1px solid ${gig.status === 'In Progress' ? 'rgba(249, 115, 22, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    {gig.status}
                  </span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                    <Clock size={12} /> Due: {gig.deadline}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-panel card-hover" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', flex: '1 1 300px', background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.7) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
          <div style={{ 
            width: '90px', 
            height: '90px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)'
          }}>
            <TrendingUp size={36} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Boost Your Profile</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Complete your skill assessments to unlock premium campus gigs and earn up to 30% more.
          </p>
          <button className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>Take Assessment</button>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .lucide-spin { animation: spin 1s linear infinite; }
      `}</style>
    </motion.div>
  );
};

export default Dashboard;
