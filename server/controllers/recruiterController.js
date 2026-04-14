const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({ userId: req.user._id });
    const user = await User.findById(req.user._id);
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: { ...profile.toObject(), name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOneAndUpdate({ userId: req.user._id }, req.body, { new: true, runValidators: true });
    if (req.body.name) await User.findByIdAndUpdate(req.user._id, { name: req.body.name });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate({ path: 'seekerId', select: 'name email phone avatar' })
      .sort({ matchScore: -1, appliedAt: -1 });
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId).populate('jobId');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.jobId.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    application.status = req.body.status;
    application.updatedAt = new Date();
    await application.save();
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id });
    const jobIds = jobs.map(j => j._id);
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'approved').length;
    const totalViews = jobs.reduce((sum, j) => sum + j.views, 0);
    const totalApplications = await Application.countDocuments({ jobId: { $in: jobIds } });
    const statusBreakdown = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const recentApplications = await Application.find({ jobId: { $in: jobIds } })
      .populate({ path: 'seekerId', select: 'name email avatar' })
      .populate({ path: 'jobId', select: 'title role' })
      .sort({ appliedAt: -1 })
      .limit(10);
    res.json({
      success: true,
      data: { totalJobs, activeJobs, totalViews, totalApplications, statusBreakdown, recentApplications }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCompanyProfile = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Company not found' });
    const jobs = await Job.find({ recruiterId: profile.userId, status: 'approved' }).sort({ postedAt: -1 });
    const user = await User.findById(profile.userId).select('name email');
    res.json({ success: true, data: { company: profile, jobs, contact: user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopCompanies = async (req, res) => {
  try {
    const companies = await RecruiterProfile.find({ verified: true }).limit(12);
    const result = [];
    for (const company of companies) {
      const jobCount = await Job.countDocuments({ recruiterId: company.userId, status: 'approved' });
      result.push({ ...company.toObject(), jobCount });
    }
    if (result.length < 6) {
      const moreCompanies = await RecruiterProfile.find({ verified: false }).limit(12 - result.length);
      for (const company of moreCompanies) {
        const jobCount = await Job.countDocuments({ recruiterId: company.userId, status: 'approved' });
        result.push({ ...company.toObject(), jobCount });
      }
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
