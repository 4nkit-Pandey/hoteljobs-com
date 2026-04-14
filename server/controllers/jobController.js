const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const SeekerProfile = require('../models/SeekerProfile');

exports.getJobs = async (req, res) => {
  try {
    const { search, role, location, salaryMin, salaryMax, experienceMin, experienceMax, jobType, sort, page = 1, limit = 12 } = req.query;
    const query = { status: 'approved' };
    if (search) {
      query.$text = { $search: search };
    }
    if (role) query.role = role;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (salaryMin) query.salaryMax = { $gte: parseInt(salaryMin) };
    if (salaryMax) query.salaryMin = { $lte: parseInt(salaryMax) };
    if (experienceMin !== undefined) query.experienceMax = { $gte: parseInt(experienceMin) };
    if (experienceMax !== undefined) query.experienceMin = { $lte: parseInt(experienceMax) };
    if (jobType) query.jobType = jobType;

    let sortOption = { postedAt: -1 };
    if (sort === 'salary-high') sortOption = { salaryMax: -1 };
    if (sort === 'salary-low') sortOption = { salaryMin: 1 };
    if (sort === 'relevance' && search) sortOption = { score: { $meta: 'textScore' } };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sortOption)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: jobs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    job.views += 1;
    await job.save();
    const similarJobs = await Job.find({ role: job.role, _id: { $ne: job._id }, status: 'approved' }).limit(4);
    res.json({ success: true, data: job, similarJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    req.body.recruiterId = req.user._id;
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await job.deleteOne();
    await Application.deleteMany({ jobId: req.params.id });
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    const existingApp = await Application.findOne({ jobId: req.params.id, seekerId: req.user._id });
    if (existingApp) return res.status(400).json({ success: false, message: 'Already applied' });

    // Calculate match score
    const profile = await SeekerProfile.findOne({ userId: req.user._id });
    let matchScore = 0;
    if (profile && profile.skills.length > 0 && job.skills.length > 0) {
      const matched = profile.skills.filter(s => job.skills.map(js => js.toLowerCase()).includes(s.toLowerCase()));
      matchScore = Math.round((matched.length / job.skills.length) * 100);
    }

    const application = await Application.create({
      jobId: req.params.id,
      seekerId: req.user._id,
      coverLetter: req.body.coverLetter || '',
      matchScore
    });
    job.applicationCount += 1;
    await job.save();
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'approved', featured: true }).sort({ postedAt: -1 }).limit(8);
    if (jobs.length < 8) {
      const moreJobs = await Job.find({ status: 'approved', featured: false }).sort({ postedAt: -1 }).limit(8 - jobs.length);
      jobs.push(...moreJobs);
    }
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ status: 'approved' });
    const roleStats = await Job.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$role', count: { $sum: 1 }, avgSalary: { $avg: { $add: ['$salaryMin', '$salaryMax'] } } } },
      { $sort: { count: -1 } }
    ]);
    const locationStats = await Job.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const salaryRanges = await Job.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$role', minSalary: { $min: '$salaryMin' }, maxSalary: { $max: '$salaryMax' }, avgMin: { $avg: '$salaryMin' }, avgMax: { $avg: '$salaryMax' } } }
    ]);
    res.json({ success: true, data: { totalJobs, roleStats, locationStats, salaryRanges } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
