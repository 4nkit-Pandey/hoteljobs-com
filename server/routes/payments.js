const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMySubscription } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('recruiter'));
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/subscription', getMySubscription);

module.exports = router;
