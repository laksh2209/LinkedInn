import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @desc    Get user's network statistics
// @route   GET /api/connections/stats
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('connections', 'firstName lastName profilePicture title company')
    .populate('followers', 'firstName lastName profilePicture title company')
    .populate('following', 'firstName lastName profilePicture title company');

  const stats = {
    connections: user.connections.length,
    followers: user.followers.length,
    following: user.following.length,
    pendingConnections: user.pendingConnections.length
  };

  res.json({
    success: true,
    data: stats
  });
}));

// @desc    Get mutual connections
// @route   GET /api/connections/mutual/:userId
// @access  Private
router.get('/mutual/:userId', protect, asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  const targetUser = await User.findById(req.params.userId);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Find mutual connections
  const mutualConnections = currentUser.connections.filter(connectionId =>
    targetUser.connections.includes(connectionId)
  );

  const mutualUsers = await User.find({
    _id: { $in: mutualConnections }
  }).select('firstName lastName profilePicture title company');

  res.json({
    success: true,
    data: mutualUsers
  });
}));

// @desc    Get connection suggestions based on mutual connections
// @route   GET /api/connections/suggestions
// @access  Private
router.get('/suggestions', protect, asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).populate('connections');
  
  // Get all users connected to current user's connections
  const connectionIds = currentUser.connections.map(conn => conn._id);
  
  const suggestions = await User.find({
    _id: { 
      $nin: [
        ...connectionIds,
        ...currentUser.following,
        ...currentUser.pendingConnections,
        req.user._id
      ]
    },
    connections: { $in: connectionIds },
    isActive: true
  })
    .select('firstName lastName profilePicture title company location skills')
    .limit(10);

  res.json({
    success: true,
    data: suggestions
  });
}));

// @desc    Get connections by company
// @route   GET /api/connections/company/:company
// @access  Private
router.get('/company/:company', protect, asyncHandler(async (req, res) => {
  const company = decodeURIComponent(req.params.company);
  
  const connections = await User.find({
    _id: { $in: req.user.connections },
    company: { $regex: company, $options: 'i' },
    isActive: true
  }).select('firstName lastName profilePicture title company location');

  res.json({
    success: true,
    data: connections
  });
}));

// @desc    Get connections by location
// @route   GET /api/connections/location/:location
// @access  Private
router.get('/location/:location', protect, asyncHandler(async (req, res) => {
  const location = decodeURIComponent(req.params.location);
  
  const connections = await User.find({
    _id: { $in: req.user.connections },
    location: { $regex: location, $options: 'i' },
    isActive: true
  }).select('firstName lastName profilePicture title company location');

  res.json({
    success: true,
    data: connections
  });
}));

// @desc    Get connections by skills
// @route   GET /api/connections/skills/:skills
// @access  Private
router.get('/skills/:skills', protect, asyncHandler(async (req, res) => {
  const skills = req.params.skills.split(',').map(skill => skill.trim().toLowerCase());
  
  const connections = await User.find({
    _id: { $in: req.user.connections },
    skills: { $in: skills },
    isActive: true
  }).select('firstName lastName profilePicture title company location skills');

  res.json({
    success: true,
    data: connections
  });
}));

// @desc    Remove connection
// @route   DELETE /api/connections/:userId
// @access  Private
router.delete('/:userId', protect, asyncHandler(async (req, res) => {
  if (req.params.userId === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot remove yourself as a connection'
    });
  }

  const currentUser = await User.findById(req.user._id);
  const targetUser = await User.findById(req.params.userId);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if they are connected
  const isConnected = currentUser.connections.includes(req.params.userId);
  
  if (!isConnected) {
    return res.status(400).json({
      success: false,
      message: 'Not connected with this user'
    });
  }

  // Remove connection from both users
  currentUser.connections = currentUser.connections.filter(id => 
    id.toString() !== req.params.userId
  );
  targetUser.connections = targetUser.connections.filter(id => 
    id.toString() !== req.user._id.toString()
  );

  await Promise.all([currentUser.save(), targetUser.save()]);

  res.json({
    success: true,
    message: 'Connection removed'
  });
}));

// @desc    Get connection requests sent by current user
// @route   GET /api/connections/sent-requests
// @access  Private
router.get('/sent-requests', protect, asyncHandler(async (req, res) => {
  const users = await User.find({
    pendingConnections: req.user._id,
    isActive: true
  }).select('firstName lastName profilePicture title company location');

  res.json({
    success: true,
    data: users
  });
}));

// @desc    Cancel connection request
// @route   DELETE /api/connections/cancel-request/:userId
// @access  Private
router.delete('/cancel-request/:userId', protect, asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.userId);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if request was sent
  const hasPendingRequest = targetUser.pendingConnections.includes(req.user._id);
  
  if (!hasPendingRequest) {
    return res.status(400).json({
      success: false,
      message: 'No pending connection request to this user'
    });
  }

  // Remove from pending connections
  targetUser.pendingConnections = targetUser.pendingConnections.filter(id => 
    id.toString() !== req.user._id.toString()
  );

  await targetUser.save();

  res.json({
    success: true,
    message: 'Connection request cancelled'
  });
}));

export default router; 