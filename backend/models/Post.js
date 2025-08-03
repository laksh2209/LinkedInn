import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2000, 'Post content cannot exceed 2000 characters']
  },
  media: [{
    type: String, // URLs to images/videos
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Media URLs must be valid HTTP/HTTPS URLs'
    }
  }],
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: [300, 'Reply cannot exceed 300 characters']
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    type: String,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

// Index for search functionality
postSchema.index({ 
  content: 'text', 
  hashtags: 'text' 
});

// Index for efficient queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'likes.user': 1 });

// Pre-save middleware to extract hashtags
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Extract hashtags from content
    const hashtagRegex = /#[\w]+/g;
    const hashtags = this.content.match(hashtagRegex);
    if (hashtags) {
      this.hashtags = [...new Set(hashtags.map(tag => tag.toLowerCase()))];
    }
    
    // Extract mentions from content
    const mentionRegex = /@[\w]+/g;
    const mentions = this.content.match(mentionRegex);
    if (mentions) {
      // This would need to be resolved to actual user IDs in the controller
      // For now, we'll just store the mention strings
    }
  }
  next();
});

// Method to check if user has liked the post
postSchema.methods.hasUserLiked = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to check if user has shared the post
postSchema.methods.hasUserShared = function(userId) {
  return this.shares.some(share => share.user.toString() === userId.toString());
};

// Method to add like
postSchema.methods.addLike = function(userId) {
  if (!this.hasUserLiked(userId)) {
    this.likes.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};

// Method to add comment
postSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

// Method to add share
postSchema.methods.addShare = function(userId) {
  if (!this.hasUserShared(userId)) {
    this.shares.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to get public post data
postSchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    author: this.author,
    content: this.content,
    media: this.media,
    hashtags: this.hashtags,
    mentions: this.mentions,
    likeCount: this.likeCount,
    commentCount: this.commentCount,
    shareCount: this.shareCount,
    isPublic: this.isPublic,
    isEdited: this.isEdited,
    location: this.location,
    visibility: this.visibility,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Ensure virtuals are included in JSON output
postSchema.set('toJSON', { virtuals: true });

const Post = mongoose.model('Post', postSchema);

export default Post; 