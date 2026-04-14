const mongoose = require('mongoose');

const seekerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  headline: { type: String, default: '' },
  summary: { type: String, default: '' },
  skills: [{ type: String }],
  experience: [{
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number,
    field: String
  }],
  resume: { type: String, default: '' },
  location: { type: String, default: '' },
  preferredLocations: [{ type: String }],
  expectedSalary: { min: { type: Number, default: 0 }, max: { type: Number, default: 0 } },
  currentSalary: { type: Number, default: 0 },
  noticePeriod: { type: String, default: '' },
  languages: [{ type: String }],
  totalExperience: { type: Number, default: 0 },
  preferredRoles: [{ type: String }],
  profileCompletion: { type: Number, default: 0 }
}, { timestamps: true });

seekerProfileSchema.methods.calculateCompletion = function() {
  let score = 0;
  if (this.headline) score += 10;
  if (this.summary) score += 10;
  if (this.skills.length > 0) score += 15;
  if (this.experience.length > 0) score += 20;
  if (this.education.length > 0) score += 15;
  if (this.resume) score += 15;
  if (this.location) score += 5;
  if (this.languages.length > 0) score += 5;
  if (this.preferredRoles.length > 0) score += 5;
  this.profileCompletion = score;
  return score;
};

module.exports = mongoose.model('SeekerProfile', seekerProfileSchema);
