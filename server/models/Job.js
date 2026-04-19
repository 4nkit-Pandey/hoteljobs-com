const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String, default: '' },
  title: { type: String, required: [true, 'Job title is required'], trim: true },
  description: { type: String, required: [true, 'Job description is required'] },
  role: {
    type: String,
    required: true,
    enum: [
      // F&B Service
      'F&B Director', 'Corporate F&B Manager', 'F&B Manager', 'Asst. F&B Manager',
      'Restaurant Manager', 'Asst. Restaurant Manager', 'F&B Executive', 'Senior Captain',
      'Captain', 'Trainee Captain', 'Sr. Steward', 'Steward', 'Asst. Steward',
      'Trainee Steward', 'G.R.E.', 'Asst. G.R.E.', 'Trainee G.R.E.',
      // F&B Production
      'Corporate Chef', 'Executive Chef', 'Sous Chef', 'C.D.P.', 'Commis', 'Kitchen Stewarding',
      // Front Office
      'Front Office Manager', 'Asst. Front Office Manager', 'Sr. Receptionist',
      'Receptionist', 'Asst. Receptionist', 'Bell Boy', 'Lobby Manager',
      'Asst. Lobby Manager', 'Room Sales Manager', 'Asst. Room Sales Manager',
      // Hotel Management
      'General Manager', 'Hotel Manager', 'Operations Manager',
      'Guest Relations Manager', 'Banquet Manager', 'Event Manager', 'Hospitality Executive',
      // Accounts
      'C.A.', 'Revenue Manager', 'Account Manager', 'Asst. Account Manager',
      'Account Executive', 'Purchase Manager', 'Asst. Purchase Manager', 'Purchase Executive', 'Cashier',
      // Housekeeping
      'Housekeeping Manager', 'Housekeeping Executive', 'Room Attendant', 'Gardener',
      // Security
      'C.S.O.', 'Security Manager', 'Security Supervisor', 'Security Guard', 'Doorman', 'P.S.O.', 'Bouncer', 'Gunman',
      // Maintenance
      'Maintenance Manager', 'Engineer', 'Plumber', 'Mason', 'Painter',
      // Cook
      'Head Cook', 'Cook', 'Assistant Cook', 'Breakfast Cook', 'Tandoor Cook',
      // Other
      'Spa Manager', 'Spa Therapist', 'Sales Manager', 'Marketing Manager',
      'Helper', 'Job Trainee', 'Other',
    ]
  },
  location: { type: String, required: true },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  salaryMin: { type: Number, default: 0 },
  salaryMax: { type: Number, default: 0 },
  salaryPeriod: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  experienceMin: { type: Number, default: 0 },
  experienceMax: { type: Number, default: 0 },
  skills: [{ type: String }],
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' },
  shift: { type: String, enum: ['day', 'night', 'rotational', 'flexible'], default: 'rotational' },
  openings: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'closed'], default: 'approved' },
  featured: { type: Boolean, default: false },
  easyApply: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 },
  deadline: { type: Date },
  postedAt: { type: Date, default: Date.now }
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', role: 'text', location: 'text' });
jobSchema.index({ role: 1, location: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
