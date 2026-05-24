import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Import Models
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flexigig';

console.log('Connecting to MongoDB at:', MONGO_URI);

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 3000
})
  .then(async () => {
    console.log('✅ Connected successfully!');
    
    const users = await User.find({});
    const jobs = await Job.find({});
    const applications = await Application.find({});
    
    console.log('\n========================================');
    console.log('          DATABASE STATUS: flexigig     ');
    console.log('========================================');
    
    console.log(`\n👥 USERS (${users.length}):`);
    if (users.length === 0) {
      console.log('  No users registered yet.');
    } else {
      users.forEach(u => {
        console.log(`  - [${u.role.toUpperCase()}] ${u.name} (${u.email})`);
        console.log(`    Logins: ${u.loginCount || 0} | Status: ${u.status} | Earnings: ₹${u.earnings || 0}`);
      });
    }
    
    console.log(`\n💼 JOBS (${jobs.length}):`);
    if (jobs.length === 0) {
      console.log('  No jobs posted yet.');
    } else {
      jobs.forEach(j => {
        console.log(`  - ${j.title} by ${j.dept} (${j.location}) | Pay: ${j.pay}`);
      });
    }
    
    console.log(`\n📄 APPLICATIONS (${applications.length}):`);
    if (applications.length === 0) {
      console.log('  No applications yet.');
    } else {
      applications.forEach(a => {
        console.log(`  - Student ${a.studentName || 'Unknown'} applied for Job ID: ${a.jobId} (Status: ${a.status})`);
      });
    }
    
    console.log('\n========================================\n');
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
