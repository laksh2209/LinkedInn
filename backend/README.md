# Connect Sphere Backend API

A comprehensive backend API for the Connect Sphere social networking platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with password hashing
- **Social Networking**: Posts, comments, likes, shares, and connections
- **User Profiles**: Comprehensive user profiles with skills, interests, and professional info
- **Real-time Notifications**: Notification system for social interactions
- **Search & Discovery**: User and post search functionality
- **Connection Management**: LinkedIn-style connection system
- **Security**: Rate limiting, input validation, and security middleware
- **File Upload**: Support for profile pictures and media uploads

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/connect-sphere
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # Optional: Cloudinary for image uploads
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software Engineer passionate about web development",
  "title": "Senior Software Engineer",
  "company": "TechCorp",
  "location": "San Francisco, CA",
  "skills": ["JavaScript", "React", "Node.js"],
  "interests": ["Web Development", "AI", "Open Source"]
}
```

### Posts Endpoints

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Just shipped a new feature! 🚀",
  "visibility": "public",
  "location": "San Francisco, CA"
}
```

#### Get Feed
```http
GET /api/posts?page=1&limit=10
Authorization: Bearer <token>
```

#### Like/Unlike Post
```http
POST /api/posts/:postId/like
Authorization: Bearer <token>
```

#### Add Comment
```http
POST /api/posts/:postId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great work! 👏"
}
```

### Users Endpoints

#### Get User Profile
```http
GET /api/users/:userId
Authorization: Bearer <token>
```

#### Search Users
```http
GET /api/users/search?q=john&skills=javascript&location=san francisco
Authorization: Bearer <token>
```

#### Follow/Unfollow User
```http
POST /api/users/:userId/follow
Authorization: Bearer <token>
```

#### Send Connection Request
```http
POST /api/users/:userId/connect
Authorization: Bearer <token>
```

#### Accept Connection Request
```http
POST /api/users/:userId/accept-connection
Authorization: Bearer <token>
```

### Notifications Endpoints

#### Get Notifications
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

## 🗄️ Database Models

### User Model
- Basic info: firstName, lastName, email, password
- Profile: bio, title, company, location, website
- Social: skills, interests, profilePicture, coverPhoto
- Network: followers, following, connections, pendingConnections
- Security: password reset tokens, email verification

### Post Model
- Content: text content, media URLs, hashtags, mentions
- Engagement: likes, comments, shares
- Metadata: visibility, location, edit history
- Social features: nested comments with replies

### Notification Model
- Types: like, comment, follow, connection_request, etc.
- Recipients and senders
- Read/unread status
- Metadata for different notification types

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware
- **Error Handling**: Comprehensive error handling and logging

## 🚀 Deployment

### Environment Variables
Make sure to set the following environment variables in production:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/connect-sphere
JWT_SECRET=your-super-secret-production-jwt-key
```

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your environment variables

### Cloudinary Setup (Optional)
For image uploads:
1. Create a Cloudinary account
2. Get your cloud name, API key, and secret
3. Update the Cloudinary environment variables

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Scripts

```bash
# Development
npm run dev

# Production
npm start

# Build
npm run build

# Lint
npm run lint

# Test
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@connectsphere.com or create an issue in the repository.

## 🔗 Frontend Integration

This backend is designed to work with the Connect Sphere frontend React application. Make sure to:

1. Set the correct API base URL in your frontend
2. Handle authentication tokens properly
3. Implement proper error handling for API responses
4. Use the provided API endpoints for all social networking features

## 📊 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
``` 