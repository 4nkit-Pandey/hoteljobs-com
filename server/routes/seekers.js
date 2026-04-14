const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, uploadResume, getApplications, getSavedJobs, saveJob, getRecommendations } = require('../controllers/seekerController');
const { protect, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `resume_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF and DOC files are allowed'));
}});

router.use(protect, authorize('seeker'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/resume', upload.single('resume'), uploadResume);
router.get('/applications', getApplications);
router.get('/saved-jobs', getSavedJobs);
router.post('/saved-jobs/:jobId', saveJob);
router.get('/recommendations', getRecommendations);

module.exports = router;
