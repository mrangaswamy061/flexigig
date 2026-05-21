import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: String,
  studentCollege: String,
  studentMajor: String,
  studentRating: Number,
  studentLoc: [Number],
  status: { type: String, default: 'Pending' }, // Pending, Accepted, Rejected
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);
