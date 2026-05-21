import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import Models
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`➡️  [${req.method}] ${req.url}`);
  next();
});

// --- MONGODB CONNECTION ---
console.log('Database connection string:', process.env.MONGO_URI ? (process.env.MONGO_URI.startsWith('mongodb+srv://') ? 'mongodb+srv://[REDACTED]@' + process.env.MONGO_URI.split('@')[1] : process.env.MONGO_URI.substring(0, 30)) : 'undefined');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 2000, // Fast fail in 2 seconds to trigger mock mode fallback instantly
  tlsAllowInvalidCertificates: true
})
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB connection error (Running in Mock Fallback Mode):', err));

const isMongoConnected = () => mongoose.connection.readyState === 1;

// --- MOCK DATABASE FALLBACK DATA ---
const mockUsers = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'student', contact: '1234567890' },
  { id: '2', name: 'Priya Sharma', email: 'priya@example.com', role: 'student', contact: '9876543210' },
  { id: '3', name: 'Local Coffee Shop', email: 'employer@example.com', role: 'employer', contact: '5555555555' },
  { id: '4', name: 'System Admin', email: 'admin@example.com', role: 'admin' }
];

const mockJobs = [
  { id: 'j1', title: 'Research Assistant', dept: 'Psychology Dept', type: 'On Campus', employerType: 'Campus', distance: 0.5, location: 'Main Campus', pay: '₹400/hr', duration: '10 hrs/wk', tags: ['Research', 'Data'], skillLevel: 'Skilled', latlng: [28.6139, 77.2090] },
  { id: 'j2', title: 'Barista (Part-time)', dept: 'Local Coffee Shop', type: 'In Person', employerType: 'Local Business', distance: 1.2, location: 'Downtown Avenue', pay: '₹250/hr', duration: '15 hrs/wk', tags: ['Customer Service'], skillLevel: 'Unskilled', latlng: [28.6189, 77.2190] }
];

const mockApplications = [];

// --- API ROUTES ---

// Auth & Users
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Basic email format regex validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!isMongoConnected()) {
      console.log('⚠️ MongoDB not connected. Falling back to Mock Login.');
      let user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = { id: 'user_' + Date.now(), name: email.split('@')[0], email, role: role || 'student' };
        mockUsers.push(user);
      }
      return res.json({ message: 'Login successful (Mock Mode)', user });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please register first.' });
    }
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, contact, name, role } = req.body;
    
    // Basic email format regex validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!isMongoConnected()) {
      console.log('⚠️ MongoDB not connected. Falling back to Mock Registration.');
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(403).json({ error: 'Permission Denied: A profile with this email already exists.' });
      }
      const newUser = { id: 'user_' + Date.now(), name, email, role, contact };
      mockUsers.push(newUser);
      return res.status(201).json({ message: 'Profile created successfully (Mock Mode)', user: newUser });
    }

    // Check if user already exists
    const query = [{ email }];
    if (contact) query.push({ contact });

    const existingUser = await User.findOne({ $or: query });
    if (existingUser) {
      return res.status(403).json({ error: 'Permission Denied: A profile with this email or phone number already exists.' });
    }

    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: 'Profile created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json(mockUsers);
    }
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profile & Reviews
app.get('/api/profile', (req, res) => {
  res.json({
    name: 'Student User',
    major: 'Computer Science',
    location: 'Campus',
    rating: 5,
    reviewsCount: 1,
    about: 'Ready for gigs!',
    education: {
      degree: 'B.S. Computer Science',
      university: 'State University',
      period: '2024 - 2028'
    },
    reviews: []
  });
});

app.post('/api/reviews', (req, res) => {
  res.status(201).json({ updatedProfile: { ...req.body, reviews: [req.body] } });
});

// Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json(mockJobs);
    }
    const jobs = await Job.find().sort({ createdAt: -1 });
    const mappedJobs = jobs.map(j => ({ ...j.toObject(), id: j._id.toString() }));
    res.json(mappedJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const newJob = { id: 'job_' + Date.now(), ...req.body };
      mockJobs.push(newJob);
      return res.status(201).json(newJob);
    }
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json({ ...newJob.toObject(), id: newJob._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/jobs/:id/status', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const job = mockJobs.find(j => j.id === req.params.id);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      job.status = req.body.status;
      return res.json(job);
    }
    const job = await Job.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ ...job.toObject(), id: job._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const index = mockJobs.findIndex(j => j.id === req.params.id);
      if (index !== -1) mockJobs.splice(index, 1);
      return res.json({ message: 'Job deleted' });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Applications
app.get('/api/applications', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json(mockApplications);
    }
    const apps = await Application.find().populate('jobId').populate('studentId');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const newApp = { id: 'app_' + Date.now(), ...req.body };
      mockApplications.push(newApp);
      return res.status(201).json(newApp);
    }
    const newApp = new Application(req.body);
    await newApp.save();
    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
  });
}

export default app;
