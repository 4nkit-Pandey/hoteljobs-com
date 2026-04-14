const User = require('../models/User');
const SeekerProfile = require('../models/SeekerProfile');
const RecruiterProfile = require('../models/RecruiterProfile');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone, role: role || 'seeker' });
    if (user.role === 'seeker') {
      await SeekerProfile.create({ userId: user._id });
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.create({ userId: user._id, companyName: req.body.companyName || 'My Company' });
    }
    const token = user.generateToken();
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = user.generateToken();
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'seeker') {
      profile = await SeekerProfile.findOne({ userId: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ userId: user._id });
    }
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar }, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
