const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getMyJobs, getApplicants, updateApplicationStatus, getAnalytics, getCompanyProfile, getTopCompanies } = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/auth');

router.get('/top-companies', getTopCompanies);
router.get('/company/:id', getCompanyProfile);
router.use(protect, authorize('recruiter'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/jobs', getMyJobs);
router.get('/applicants/:jobId', getApplicants);
router.put('/applicants/:applicationId', updateApplicationStatus);
router.get('/analytics', getAnalytics);

module.exports = router;
