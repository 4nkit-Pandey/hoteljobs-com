const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['applied', 'viewed', 'shortlisted', 'rejected', 'hired'], default: 'applied' },
  coverLetter: { type: String, default: '' },
  matchScore: { type: Number, default: 0 },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
