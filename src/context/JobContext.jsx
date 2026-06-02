import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth } from './AuthContext';

const JobContext = createContext();

export const useJobs = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  const { userProfile } = useAuth();
  
  const [globalJobs, setGlobalJobs] = useState([]);
  
  // Applications state (persisted locally as a fallback, or fetched from backend)
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('flexigig_applications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Applied jobs keyed by email (fallback for student applications)
  const [appliedJobsByEmail, setAppliedJobsByEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('flexigig_appliedJobs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const userEmail = userProfile?.email;
  const appliedJobs = userEmail ? (appliedJobsByEmail[userEmail] || []) : [];

  const fetchJobs = async () => {
    try {
      const jobsRes = await fetch(`${API_BASE_URL}/api/jobs`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData) {
          setGlobalJobs(jobsData);
        }
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const appsRes = await fetch(`${API_BASE_URL}/api/applications`);
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        if (appsData && appsData.length > 0) {
          setApplications(appsData);
        }
      }
    } catch (err) {
      console.warn("Mock applications fallback", err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const handleSetAppliedJobs = (updater) => {
    if (!userEmail) return;
    setAppliedJobsByEmail(prev => {
      const currentApplied = prev[userEmail] || [];
      const nextApplied = typeof updater === 'function' ? updater(currentApplied) : updater;
      const updated = { ...prev, [userEmail]: nextApplied };
      localStorage.setItem('flexigig_appliedJobs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSetApplications = (updater) => {
    setApplications(prev => {
      const nextApps = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('flexigig_applications', JSON.stringify(nextApps));
      return nextApps;
    });
  };

  const value = {
    globalJobs,
    setGlobalJobs,
    fetchJobs,
    applications,
    setApplications: handleSetApplications,
    appliedJobs,
    setAppliedJobs: handleSetAppliedJobs
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
