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
    enum: ['Chef', 'Sous Chef', 'Waiter', 'Waitress', 'Hotel Manager', 'General Manager',
           'Housekeeping', 'Front Desk', 'Receptionist', 'Bartender', 'Concierge',
           'Room Service', 'F&B Manager', 'Kitchen Staff', 'Banquet Manager',
           'Spa Therapist', 'Security', 'Maintenance', 'Event Manager', 'Hospitality Executive', 'Other']
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
