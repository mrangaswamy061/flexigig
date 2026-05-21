import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { type: String, required: true }, // In real app, hash this
  role: { type: String, enum: ['student', 'employer', 'admin'], required: true },
  
  // Student specific
  college: String,
  major: String,
  completedGigs: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  
  // Employer specific
  businessType: String,
  contact: { type: String, unique: true, sparse: true },
  totalHired: { type: Number, default: 0 },
  
  // Common
  rating: { type: Number, default: 5.0 },
  status: { type: String, default: 'Active' },
  avatar: String,
  location: String,
  address: String
}, { timestamps: true });

export default mongoose.model('User', userSchema);
