import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({
    recipient: req.user._id,
    isDeleted: false
  })
    .populate('sender', 'firstName lastName profilePicture')
    .populate('post', 'content')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({
    recipient: req.user._id,
    isDeleted: false
  });

  res.json({
    success: true,
    data: notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user._id);

  res.json({
    success: true,
    data: { count }
  });
}));

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.markAsRead();

  res.json({
    success: true,
    message: 'Notification marked as read'
  });
}));

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
router.put('/mark-all-read', protect, asyncHandler(async (req, res) => {
  await Notification.markAllAsRead(req.user._id);

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.markAsDeleted();

  res.json({
    success: true,
    message: 'Notification deleted'
  });
}));

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
router.delete('/', protect, asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id },
    { isDeleted: true }
  );

  res.json({
    success: true,
    message: 'All notifications deleted'
  });
}));

export default router; 