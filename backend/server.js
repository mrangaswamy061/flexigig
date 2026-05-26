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
let MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Swamy:swamy1234@cluster0.efwvvz1.mongodb.net/flexigig';

// If running in production Vercel cloud, ALWAYS force use the verified MongoDB Atlas cloud database!
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Running in production Vercel cloud! Forcing connection to verified MongoDB Atlas database...');
  MONGO_URI = 'mongodb+srv://Swamy:swamy1234@cluster0.efwvvz1.mongodb.net/flexigig';
}

console.log('Database connection string:', MONGO_URI.startsWith('mongodb+srv://') ? 'mongodb+srv://[REDACTED]@' + MONGO_URI.split('@')[1] : MONGO_URI.substring(0, 30));

// Disable command buffering globally so mongoose fails fast when connection is offline
mongoose.set('bufferCommands', false);

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Give it 5 seconds to connect securely in the cloud
  tlsAllowInvalidCertificates: true,
  family: 4 // Force IPv4 to prevent Node 18+ hostname resolution hangs in serverless environments
})
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB connection error (Running in Mock Fallback Mode):', err));

const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// --- MOCK DATABASE FALLBACK DATA ---
const mockUsers = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'student', contact: '1234567890' },
  { id: '2', name: 'Priya Sharma', email: 'priya@example.com', role: 'student', contact: '9876543210' },
  { id: '3', name: 'Local Coffee Shop', email: 'employer@example.com', role: 'employer', contact: '5555555555' },
  { id: '4', name: 'System Admin', email: 'admin@example.com', role: 'admin' }
];

const mockJobs = [];

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
        user = { id: 'user_' + Date.now(), name: email.split('@')[0], email, role: role || 'student', loginCount: 1, lastLogin: new Date() };
        mockUsers.push(user);
      } else {
        user.loginCount = (user.loginCount || 0) + 1;
        user.lastLogin = new Date();
      }
      return res.json({ message: 'Login successful (Mock Mode)', user });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please register first.' });
    }
    
    // Increment loginCount and update lastLogin
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date();
    await user.save();

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

// Stats API
app.get('/api/stats', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const studentCount = mockUsers.filter(u => u.role === 'student' && u.loginCount > 0).length;
      const jobCount = mockJobs.length;
      const totalEarnings = mockUsers
        .filter(u => u.role === 'student')
        .reduce((sum, u) => {
          let earn = 0;
          if (typeof u.earnings === 'string') {
            const parsed = parseInt(u.earnings.replace(/[^\d]/g, ''), 10);
            earn = isNaN(parsed) ? 0 : parsed;
          } else {
            earn = u.earnings || 0;
          }
          return sum + earn;
        }, 0);
      
      const studentsWithRating = mockUsers.filter(u => u.role === 'student' && u.rating);
      const avgRating = studentsWithRating.length > 0
        ? (studentsWithRating.reduce((sum, u) => sum + u.rating, 0) / studentsWithRating.length).toFixed(1)
        : '5.0';

      return res.json({
        activeStudents: studentCount,
        gigsPosted: jobCount,
        earnedByStudents: totalEarnings,
        avgRating
      });
    }

    // Only count students who have logged in at least once
    const studentCount = await User.countDocuments({ role: 'student', loginCount: { $gt: 0 } });
    const jobCount = await Job.countDocuments();
    
    const earningsAgg = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: null, total: { $sum: '$earnings' } } }
    ]);
    const totalEarnings = earningsAgg.length > 0 ? earningsAgg[0].total : 0;

    const ratingAgg = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const avgRating = ratingAgg.length > 0 ? ratingAgg[0].avg.toFixed(1) : '5.0';

    res.json({
      activeStudents: studentCount,
      gigsPosted: jobCount,
      earnedByStudents: totalEarnings,
      avgRating
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
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
