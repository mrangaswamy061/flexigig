import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dept: { type: String, required: true }, // Company name or department
  type: { type: String, required: true }, // In Person, Remote, Hybrid
  employerType: { type: String, required: true }, // Local Business, Campus
  distance: { type: Number, default: 0 },
  location: { type: String, required: true },
  pay: { type: String, required: true },
  duration: { type: String, required: true },
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
