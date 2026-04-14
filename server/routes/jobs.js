const express = require('express');
const router = express.Router();
const { getJobs, getJob, createJob, updateJob, deleteJob, applyToJob, getFeaturedJobs, getJobStats } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/featured', getFeaturedJobs);
router.get('/stats', getJobStats);
router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);
router.post('/:id/apply', protect, authorize('seeker'), applyToJob);

module.exports = router;
