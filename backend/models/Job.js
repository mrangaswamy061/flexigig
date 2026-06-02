import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true }, // We'll use this for the optional description or title
  dept: { type: String, default: 'Local Business' }, // Company name or department
  type: { type: String, default: 'In Person' }, // In Person, Remote, Hybrid
  employerType: { type: String, default: 'Local Business' }, // Local Business, Campus
  distance: { type: Number, default: 0 },
  location: { type: String, required: true }, // We will auto-fill this with reverse geocoding
  pay: { type: String, required: true },
  startTime: { type: String }, // New field
  endTime: { type: String }, // New field
  duration: { type: String },
  description: { type: String }, // Optional details
  tags: [{ type: String }],
  skillLevel: { type: String, default: 'Unskilled' },
  latlng: {
    type: [Number], // [lat, lng]
    default: [28.6139, 77.2090]
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedByEmail: { type: String },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
