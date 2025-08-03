import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
router.post('/', protect, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'connections', 'private'])
    .withMessage('Visibility must be public, connections, or private'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { content, media, visibility, location } = req.body;

  const post = await Post.create({
    author: req.user._id,
    content,
    media: media || [],
    visibility: visibility || 'public',
    location: location || ''
  });

  // Populate author details
  await post.populate('author', 'firstName lastName profilePicture title company');

  res.status(201).json({
    success: true,
    data: post
  });
}));

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Private
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = { isPublic: true };

  // If user is authenticated, show posts from connections and public posts
  if (req.user) {
    const user = await User.findById(req.user._id).populate('connections');
    const connectionIds = user.connections.map(conn => conn._id);
    
    query = {
      $or: [
        { isPublic: true },
        { author: { $in: connectionIds } },
        { author: req.user._id }
      ]
    };
  }

  const posts = await Post.find(query)
    .populate('author', 'firstName lastName profilePicture title company')
    .populate('likes.user', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments(query);

  res.json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'firstName lastName profilePicture title company')
    .populate('likes.user', 'firstName lastName profilePicture')
    .populate('comments.user', 'firstName lastName profilePicture')
    .populate('shares.user', 'firstName lastName profilePicture');

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Check if user has liked/shared the post
  let userLiked = false;
  let userShared = false;

  if (req.user) {
    userLiked = post.hasUserLiked(req.user._id);
    userShared = post.hasUserShared(req.user._id);
  }

  res.json({
    success: true,
    data: {
      ...post.toObject(),
      userLiked,
      userShared
    }
  });
}));

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
router.put('/:id', protect, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Check if user is the author
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this post'
    });
  }

  // Store original content in edit history
  post.editHistory.push({
    content: post.content,
    editedAt: new Date()
  });

  // Update post
  post.content = req.body.content;
  post.isEdited = true;
  
  if (req.body.media !== undefined) {
    post.media = req.body.media;
  }
  if (req.body.visibility !== undefined) {
    post.visibility = req.body.visibility;
  }
  if (req.body.location !== undefined) {
    post.location = req.body.location;
  }

  const updatedPost = await post.save();
  await updatedPost.populate('author', 'firstName lastName profilePicture title company');

  res.json({
    success: true,
    data: updatedPost
  });
}));

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Check if user is the author
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this post'
    });
  }

  await post.deleteOne();

  res.json({
    success: true,
    message: 'Post deleted successfully'
  });
}));

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
router.post('/:id/like', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const hasLiked = post.hasUserLiked(req.user._id);

  if (hasLiked) {
    // Unlike
    await post.removeLike(req.user._id);
    
    res.json({
      success: true,
      message: 'Post unliked',
      liked: false
    });
  } else {
    // Like
    await post.addLike(req.user._id);
    
    // Create notification if not liking own post
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        post: post._id,
        content: `${req.user.firstName} ${req.user.lastName} liked your post`
      });
    }
    
    res.json({
      success: true,
      message: 'Post liked',
      liked: true
    });
  }
}));

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
router.post('/:id/comments', protect, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  await post.addComment(req.user._id, req.body.content);
  
  // Populate the new comment
  await post.populate('comments.user', 'firstName lastName profilePicture');

  // Create notification if not commenting on own post
  if (post.author.toString() !== req.user._id.toString()) {
    await Notification.createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'comment',
      post: post._id,
      content: `${req.user.firstName} ${req.user.lastName} commented on your post`
    });
  }

  const newComment = post.comments[post.comments.length - 1];

  res.status(201).json({
    success: true,
    data: newComment
  });
}));

// @desc    Share post
// @route   POST /api/posts/:id/share
// @access  Private
router.post('/:id/share', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const hasShared = post.hasUserShared(req.user._id);

  if (hasShared) {
    return res.status(400).json({
      success: false,
      message: 'Post already shared'
    });
  }

  await post.addShare(req.user._id);

  // Create notification if not sharing own post
  if (post.author.toString() !== req.user._id.toString()) {
    await Notification.createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'share',
      post: post._id,
      content: `${req.user.firstName} ${req.user.lastName} shared your post`
    });
  }

  res.json({
    success: true,
    message: 'Post shared successfully'
  });
}));

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
router.get('/user/:userId', optionalAuth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find({ 
    author: req.params.userId,
    isPublic: true 
  })
    .populate('author', 'firstName lastName profilePicture title company')
    .populate('likes.user', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments({ 
    author: req.params.userId,
    isPublic: true 
  });

  res.json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Public
router.get('/search', optionalAuth, asyncHandler(async (req, res) => {
  const { q, hashtag } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = { isPublic: true };

  if (q) {
    query.$text = { $search: q };
  }

  if (hashtag) {
    query.hashtags = hashtag.toLowerCase();
  }

  const posts = await Post.find(query)
    .populate('author', 'firstName lastName profilePicture title company')
    .populate('likes.user', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments(query);

  res.json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

export default router; 