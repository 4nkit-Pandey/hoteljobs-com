const express = require('express');
const router = express.Router();
const { getUsers, updateUser, getAllJobs, approveJob, getAnalytics, getSubscriptions } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/approve', approveJob);
router.get('/analytics', getAnalytics);
router.get('/subscriptions', getSubscriptions);

module.exports = router;
