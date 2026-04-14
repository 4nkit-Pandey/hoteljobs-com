const Message = require('../models/Message');
const User = require('../models/User');

exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      { $match: { $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: { $cond: [{ $eq: ['$senderId', req.user._id] }, '$receiverId', '$senderId'] },
        lastMessage: { $first: '$content' },
        lastDate: { $first: '$createdAt' },
        unread: { $sum: { $cond: [{ $and: [{ $eq: ['$receiverId', req.user._id] }, { $eq: ['$read', false] }] }, 1, 0] } }
      }},
      { $sort: { lastDate: -1 } }
    ]);
    const conversationIds = messages.map(m => m._id);
    const users = await User.find({ _id: { $in: conversationIds } }).select('name email avatar role');
    const result = messages.map(m => {
      const otherUser = users.find(u => u._id.toString() === m._id.toString());
      return {
        _id: m._id,
        otherUserId: m._id,
        lastMessage: m.lastMessage,
        updatedAt: m.lastDate,
        unread: m.unread,
        participants: [
          { _id: req.user._id, name: 'You', role: req.user.role },
          otherUser ? { _id: otherUser._id, name: otherUser.name, role: otherUser.role, avatar: otherUser.avatar } : null
        ].filter(Boolean)
      };
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const recipientId = req.body.recipientId || req.body.receiverId;
    if (!recipientId) return res.status(400).json({ success: false, message: 'Recipient ID required' });
    const message = await Message.create({
      senderId: req.user._id,
      receiverId: recipientId,
      jobId: req.body.jobId,
      content: req.body.content
    });
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
