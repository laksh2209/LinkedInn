import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadProfileImage, uploadCoverPhoto } from '../middleware/upload.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('followers', 'firstName lastName profilePicture title company')
    .populate('following', 'firstName lastName profilePicture title company')
    .populate('connections', 'firstName lastName profilePicture title company');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if current user is following this user
  let isFollowing = false;
  let isConnected = false;
  let hasPendingConnection = false;

  if (req.user) {
    isFollowing = user.followers.some(follower => 
      follower._id.toString() === req.user._id.toString()
    );
    isConnected = user.connections.some(connection => 
      connection._id.toString() === req.user._id.toString()
    );
    hasPendingConnection = user.pendingConnections.some(pending => 
      pending.toString() === req.user._id.toString()
    );
  }

  res.json({
    success: true,
    data: {
      ...user.getPublicProfile(),
      isFollowing,
      isConnected,
      hasPendingConnection
    }
  });
}));

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
router.get('/search', optionalAuth, asyncHandler(async (req, res) => {
  const { q, skills, location, company } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = { isActive: true };

  if (q) {
    query.$text = { $search: q };
  }

  if (skills) {
    const skillArray = skills.split(',').map(skill => skill.trim().toLowerCase());
    query.skills = { $in: skillArray };
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (company) {
    query.company = { $regex: company, $options: 'i' };
  }

  const users = await User.find(query)
    .select('firstName lastName profilePicture title company location skills')
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
router.post('/:id/follow', protect, asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot follow yourself'
    });
  }

  const userToFollow = await User.findById(req.params.id);
  
  if (!userToFollow) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const currentUser = await User.findById(req.user._id);
  const isFollowing = currentUser.following.includes(req.params.id);

  if (isFollowing) {
    // Unfollow
    currentUser.following = currentUser.following.filter(id => 
      id.toString() !== req.params.id
    );
    userToFollow.followers = userToFollow.followers.filter(id => 
      id.toString() !== req.user._id.toString()
    );
    
    await Promise.all([currentUser.save(), userToFollow.save()]);
    
    res.json({
      success: true,
      message: 'User unfollowed',
      following: false
    });
  } else {
    // Follow
    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user._id);
    
    await Promise.all([currentUser.save(), userToFollow.save()]);
    
    // Create notification
    await Notification.createNotification({
      recipient: req.params.id,
      sender: req.user._id,
      type: 'follow',
      content: `${req.user.firstName} ${req.user.lastName} started following you`
    });
    
    res.json({
      success: true,
      message: 'User followed',
      following: true
    });
  }
}));

// @desc    Send connection request
// @route   POST /api/users/:id/connect
// @access  Private
router.post('/:id/connect', protect, asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot connect with yourself'
    });
  }

  const userToConnect = await User.findById(req.params.id);
  
  if (!userToConnect) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if already connected
  const currentUser = await User.findById(req.user._id);
  const isConnected = currentUser.connections.includes(req.params.id);
  
  if (isConnected) {
    return res.status(400).json({
      success: false,
      message: 'Already connected with this user'
    });
  }

  // Check if connection request already sent
  const hasPendingRequest = userToConnect.pendingConnections.includes(req.user._id);
  
  if (hasPendingRequest) {
    return res.status(400).json({
      success: false,
      message: 'Connection request already sent'
    });
  }

  // Send connection request
  userToConnect.pendingConnections.push(req.user._id);
  await userToConnect.save();

  // Create notification
  await Notification.createNotification({
    recipient: req.params.id,
    sender: req.user._id,
    type: 'connection_request',
    content: `${req.user.firstName} ${req.user.lastName} sent you a connection request`
  });

  res.json({
    success: true,
    message: 'Connection request sent'
  });
}));

// @desc    Accept connection request
// @route   POST /api/users/:id/accept-connection
// @access  Private
router.post('/:id/accept-connection', protect, asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  
  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if connection request exists
  const hasPendingRequest = currentUser.pendingConnections.includes(req.params.id);
  
  if (!hasPendingRequest) {
    return res.status(400).json({
      success: false,
      message: 'No pending connection request from this user'
    });
  }

  const userToConnect = await User.findById(req.params.id);
  
  if (!userToConnect) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Accept connection
  currentUser.connections.push(req.params.id);
  currentUser.pendingConnections = currentUser.pendingConnections.filter(id => 
    id.toString() !== req.params.id
  );

  userToConnect.connections.push(req.user._id);

  await Promise.all([currentUser.save(), userToConnect.save()]);

  // Create notification
  await Notification.createNotification({
    recipient: req.params.id,
    sender: req.user._id,
    type: 'connection_accepted',
    content: `${req.user.firstName} ${req.user.lastName} accepted your connection request`
  });

  res.json({
    success: true,
    message: 'Connection accepted'
  });
}));

// @desc    Reject connection request
// @route   POST /api/users/:id/reject-connection
// @access  Private
router.post('/:id/reject-connection', protect, asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  
  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Remove from pending connections
  currentUser.pendingConnections = currentUser.pendingConnections.filter(id => 
    id.toString() !== req.params.id
  );

  await currentUser.save();

  res.json({
    success: true,
    message: 'Connection request rejected'
  });
}));

// @desc    Get user's connections
// @route   GET /api/users/:id/connections
// @access  Public
router.get('/:id/connections', optionalAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('connections', 'firstName lastName profilePicture title company location');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user.connections
  });
}));

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
router.get('/:id/followers', optionalAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('followers', 'firstName lastName profilePicture title company location');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user.followers
  });
}));

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
router.get('/:id/following', optionalAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('following', 'firstName lastName profilePicture title company location');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user.following
  });
}));

// @desc    Get pending connection requests
// @route   GET /api/users/pending-connections
// @access  Private
router.get('/pending-connections', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('pendingConnections', 'firstName lastName profilePicture title company location');

  res.json({
    success: true,
    data: user.pendingConnections
  });
}));

// @desc    Get suggested connections
// @route   GET /api/users/suggestions
// @access  Private
router.get('/suggestions', protect, asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  
  // Get users who are not already connected, following, or pending
  const excludedUsers = [
    ...currentUser.connections,
    ...currentUser.following,
    ...currentUser.pendingConnections,
    req.user._id
  ];

  const suggestions = await User.find({
    _id: { $nin: excludedUsers },
    isActive: true
  })
    .select('firstName lastName profilePicture title company location skills')
    .limit(10);

  res.json({
    success: true,
    data: suggestions
  });
}));

// @desc    Update profile picture
// @route   PUT /api/users/profile-picture
// @access  Private
router.put('/profile-picture', protect, [
  body('profilePicture')
    .isURL()
    .withMessage('Please provide a valid URL for profile picture')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const user = await User.findById(req.user._id);
  user.profilePicture = req.body.profilePicture;
  await user.save();

  res.json({
    success: true,
    data: user.getPublicProfile()
  });
}));

// @desc    Upload profile picture
// @route   POST /api/users/upload-profile-picture
// @access  Private
router.post('/upload-profile-picture', protect, asyncHandler(async (req, res) => {
  uploadProfileImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    try {
      const user = await User.findById(req.user._id);
      // For Cloudinary, use req.file.path; for local storage, construct URL
      const profilePictureUrl = req.file.path || `/uploads/${req.file.filename}`;
      user.profilePicture = profilePictureUrl;
      await user.save();

      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          profilePicture: user.profilePicture,
          user: user.getPublicProfile()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error saving profile picture'
      });
    }
  });
}));

// @desc    Update cover photo
// @route   PUT /api/users/cover-photo
// @access  Private
router.put('/cover-photo', protect, [
  body('coverPhoto')
    .isURL()
    .withMessage('Please provide a valid URL for cover photo')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const user = await User.findById(req.user._id);
  user.coverPhoto = req.body.coverPhoto;
  await user.save();

  res.json({
    success: true,
    data: user.getPublicProfile()
  });
}));

// @desc    Upload cover photo
// @route   POST /api/users/upload-cover-photo
// @access  Private
router.post('/upload-cover-photo', protect, asyncHandler(async (req, res) => {
  uploadCoverPhoto(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    try {
      const user = await User.findById(req.user._id);
      user.coverPhoto = req.file.path; // Cloudinary URL
      await user.save();

      res.json({
        success: true,
        message: 'Cover photo uploaded successfully',
        data: {
          coverPhoto: user.coverPhoto,
          user: user.getPublicProfile()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error saving cover photo'
      });
    }
  });
}));

export default router; 