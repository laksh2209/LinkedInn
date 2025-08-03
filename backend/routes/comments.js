import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @desc    Add reply to comment
// @route   POST /api/comments/:postId/:commentId/reply
// @access  Private
router.post('/:postId/:commentId/reply', protect, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Reply must be between 1 and 300 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const post = await Post.findById(req.params.postId);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const comment = post.comments.id(req.params.commentId);
  
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  // Add reply
  comment.replies.push({
    user: req.user._id,
    content: req.body.content
  });

  await post.save();
  await post.populate('comments.replies.user', 'firstName lastName profilePicture');

  // Create notification for comment author
  if (comment.user.toString() !== req.user._id.toString()) {
    await Notification.createNotification({
      recipient: comment.user,
      sender: req.user._id,
      type: 'reply',
      post: post._id,
      comment: comment._id,
      content: `${req.user.firstName} ${req.user.lastName} replied to your comment`
    });
  }

  const newReply = comment.replies[comment.replies.length - 1];

  res.status(201).json({
    success: true,
    data: newReply
  });
}));

// @desc    Like/Unlike comment
// @route   POST /api/comments/:postId/:commentId/like
// @access  Private
router.post('/:postId/:commentId/like', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const comment = post.comments.id(req.params.commentId);
  
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  const hasLiked = comment.likes.includes(req.user._id);

  if (hasLiked) {
    // Unlike
    comment.likes = comment.likes.filter(id => 
      id.toString() !== req.user._id.toString()
    );
    
    await post.save();
    
    res.json({
      success: true,
      message: 'Comment unliked',
      liked: false
    });
  } else {
    // Like
    comment.likes.push(req.user._id);
    
    await post.save();
    
    // Create notification if not liking own comment
    if (comment.user.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        recipient: comment.user,
        sender: req.user._id,
        type: 'like',
        post: post._id,
        comment: comment._id,
        content: `${req.user.firstName} ${req.user.lastName} liked your comment`
      });
    }
    
    res.json({
      success: true,
      message: 'Comment liked',
      liked: true
    });
  }
}));

// @desc    Delete comment
// @route   DELETE /api/comments/:postId/:commentId
// @access  Private
router.delete('/:postId/:commentId', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const comment = post.comments.id(req.params.commentId);
  
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  // Check if user is the comment author or post author
  if (comment.user.toString() !== req.user._id.toString() && 
      post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this comment'
    });
  }

  comment.remove();
  await post.save();

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
}));

// @desc    Update comment
// @route   PUT /api/comments/:postId/:commentId
// @access  Private
router.put('/:postId/:commentId', protect, [
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

  const post = await Post.findById(req.params.postId);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const comment = post.comments.id(req.params.commentId);
  
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  // Check if user is the comment author
  if (comment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this comment'
    });
  }

  comment.content = req.body.content;
  await post.save();

  res.json({
    success: true,
    data: comment
  });
}));

export default router; 