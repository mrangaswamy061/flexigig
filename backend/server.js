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
mongoose.connect(process.env.MONGO_URI, {
  tlsAllowInvalidCertificates: true
})
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

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
    const { email, contact } = req.body;
    
    // Basic email format regex validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
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
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profile & Reviews
app.get('/api/profile', (req, res) => {
  // Return a mock profile since we don't have authentication state
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
    const jobs = await Job.find().sort({ createdAt: -1 });
    const mappedJobs = jobs.map(j => ({ ...j.toObject(), id: j._id.toString() }));
    res.json(mappedJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json({ ...newJob.toObject(), id: newJob._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/jobs/:id/status', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ ...job.toObject(), id: job._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Applications
app.get('/api/applications', async (req, res) => {
  try {
    const apps = await Application.find().populate('jobId').populate('studentId');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const newApp = new Application(req.body);
    await newApp.save();
    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});
