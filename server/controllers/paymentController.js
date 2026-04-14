const Subscription = require('../models/Subscription');

exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const plans = {
      basic: { price: 999, jobPostLimit: 5, featuredPosts: 0, days: 30 },
      premium: { price: 2999, jobPostLimit: 25, featuredPosts: 5, days: 30 },
      enterprise: { price: 7999, jobPostLimit: -1, featuredPosts: 20, days: 30 }
    };
    const selectedPlan = plans[plan];
    if (!selectedPlan) return res.status(400).json({ success: false, message: 'Invalid plan' });

    // Mock Razorpay order
    const mockOrderId = 'order_' + Date.now() + Math.random().toString(36).substr(2, 9);
    res.json({
      success: true,
      data: {
        orderId: mockOrderId,
        amount: selectedPlan.price * 100,
        currency: 'INR',
        plan: plan,
        ...selectedPlan
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, plan } = req.body;
    const plans = {
      basic: { price: 999, jobPostLimit: 5, featuredPosts: 0, days: 30 },
      premium: { price: 2999, jobPostLimit: 25, featuredPosts: 5, days: 30 },
      enterprise: { price: 7999, jobPostLimit: -1, featuredPosts: 20, days: 30 }
    };
    const selectedPlan = plans[plan];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedPlan.days);

    const subscription = await Subscription.create({
      recruiterId: req.user._id,
      plan,
      price: selectedPlan.price,
      jobPostLimit: selectedPlan.jobPostLimit,
      featuredPosts: selectedPlan.featuredPosts,
      endDate,
      paymentId: paymentId || 'mock_' + Date.now(),
      razorpayOrderId: orderId
    });
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      recruiterId: req.user._id, status: 'active', endDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
