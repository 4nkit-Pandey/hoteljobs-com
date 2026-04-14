const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['basic', 'premium', 'enterprise'], required: true },
  price: { type: Number, required: true },
  jobPostLimit: { type: Number, default: 5 },
  featuredPosts: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  paymentId: { type: String, default: '' },
  razorpayOrderId: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
