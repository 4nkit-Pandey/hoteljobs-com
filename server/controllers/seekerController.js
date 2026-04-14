const SeekerProfile = require('../models/SeekerProfile');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const profile = await SeekerProfile.findOne({ userId: req.user._id });
    const user = await User.findById(req.user._id);
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    const data = { ...profile.toObject(), name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, bio: profile.summary };
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Map bio -> summary for DB compatibility
    const updateData = { ...req.body };
    if (updateData.bio !== undefined) { updateData.summary = updateData.bio; delete updateData.bio; }
    let profile = await SeekerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await SeekerProfile.create({ userId: req.user._id, ...updateData });
    } else {
      Object.assign(profile, updateData);
      profile.calculateCompletion();
      await profile.save();
    }
    // Update user name/phone if provided
    if (req.body.name || req.body.phone) {
      await User.findByIdAndUpdate(req.user._id, { name: req.body.name, phone: req.body.phone });
    }
    res.json({ success: true, data: { ...profile.toObject(), bio: profile.summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a file' });
    const profile = await SeekerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { resume: req.file.path },
      { new: true }
    );
    res.json({ success: true, data: { resume: profile.resume } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ seekerId: req.user._id })
      .populate({ path: 'jobId', select: 'title companyName companyLogo location salaryMin salaryMax role jobType' })
      .sort({ appliedAt: -1 });
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const saved = await SavedJob.find({ seekerId: req.user._id })
      .populate({ path: 'jobId', select: 'title companyName companyLogo location salaryMin salaryMax role jobType postedAt easyApply' })
      .sort({ savedAt: -1 });
    res.json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const existing = await SavedJob.findOne({ seekerId: req.user._id, jobId: req.params.jobId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, saved: false, message: 'Job removed from saved' });
    }
    await SavedJob.create({ seekerId: req.user._id, jobId: req.params.jobId });
    res.json({ success: true, saved: true, message: 'Job saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const profile = await SeekerProfile.findOne({ userId: req.user._id });
    let query = { status: 'approved' };
    if (profile) {
      const conditions = [];
      if (profile.preferredRoles && profile.preferredRoles.length > 0) {
        conditions.push({ role: { $in: profile.preferredRoles } });
      }
      if (profile.skills && profile.skills.length > 0) {
        conditions.push({ skills: { $in: profile.skills } });
      }
      if (profile.location) {
        conditions.push({ location: { $regex: profile.location, $options: 'i' } });
      }
      if (conditions.length > 0) {
        query.$or = conditions;
      }
    }
    const appliedJobIds = (await Application.find({ seekerId: req.user._id }).select('jobId')).map(a => a.jobId);
    query._id = { $nin: appliedJobIds };
    const jobs = await Job.find(query).sort({ postedAt: -1 }).limit(10);
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
