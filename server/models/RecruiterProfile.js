const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String, default: '' },
  industry: { type: String, default: 'Hospitality' },
  website: { type: String, default: '' },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  city: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  address: { type: String, default: '' },
  size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'], default: '11-50' },
  foundedYear: { type: Number },
  verified: { type: Boolean, default: false },
  socialLinks: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' }
  },
  benefits: [{ type: String }],
  photos: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
