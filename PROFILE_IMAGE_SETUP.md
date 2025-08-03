# Profile Image Upload Feature Setup Guide

## Overview
This feature allows users to upload and display profile images throughout the LinkedIn-like social networking application. The implementation includes both backend file upload handling and frontend UI components.

## Backend Implementation

### 1. File Upload Middleware (`backend/middleware/upload.js`)
- Uses **Multer** with **Cloudinary** storage for image uploads
- Automatically resizes profile images to 400x400px with face detection
- Supports multiple image formats (JPG, JPEG, PNG, GIF, WEBP)
- 5MB file size limit for profile images
- 10MB file size limit for cover photos

### 2. API Endpoints
Added to `backend/routes/users.js`:

#### Upload Profile Image
```http
POST /api/users/upload-profile-picture
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: profileImage (file)
```

#### Upload Cover Photo
```http
POST /api/users/upload-cover-photo
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: coverPhoto (file)
```

## Frontend Implementation

### 1. API Service (`src/lib/api.ts`)
Added methods:
- `uploadProfileImage(file: File)`
- `uploadCoverPhoto(file: File)`

### 2. Profile Edit Modal (`src/components/ProfileEditModal.tsx`)
Enhanced with:
- Profile image preview
- File selection interface
- Drag & drop support
- Real-time image upload
- Success/error handling

### 3. Updated Components
- **PostCard**: Displays author profile images in feed posts
- **Home**: Shows user profile image in sidebar
- **Profile**: Displays profile image in header and about sections

## Setup Instructions

### 1. Install Dependencies
Backend dependencies are already included in `package.json`:
- `multer`: File upload handling
- `cloudinary`: Cloud image storage and transformation
- `multer-storage-cloudinary`: Multer-Cloudinary integration

Frontend dependencies:
- `date-fns`: Date formatting for posts

### 2. Cloudinary Setup
1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Update `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

### 3. Start the Application
```bash
# Backend (from LinkedInn/backend)
npm run dev

# Frontend (from LinkedInn)
npm run dev
```

## Features Implemented

### ✅ Complete Feature Set
1. **Profile Image Upload**
   - Secure file upload with validation
   - Automatic image optimization
   - Real-time preview
   - Cloud storage integration

2. **Profile Image Display**
   - Throughout the application (Home, Profile, Posts)
   - Consistent avatar components
   - Fallback to user initials

3. **User Experience**
   - Drag & drop file selection
   - File type and size validation
   - Loading states and error handling
   - Immediate visual feedback

### 🔧 Technical Implementation
- **Secure**: File type validation and size limits
- **Scalable**: Cloud-based storage with CDN delivery
- **Responsive**: Optimized images for different screen sizes
- **Accessible**: Proper alt text and fallback handling

## Usage

1. **Edit Profile**: Click "Edit Profile" button on profile page
2. **Upload Image**: Click on the profile image or "Change Profile Picture" button
3. **Select File**: Choose an image file (JPG, PNG, GIF, WEBP)
4. **Preview**: Image preview updates immediately
5. **Save**: Click "Save Changes" to upload and update profile

## File Structure
```
LinkedInn/
├── backend/
│   ├── middleware/
│   │   └── upload.js          # File upload configuration
│   └── routes/
│       └── users.js           # Upload endpoints
├── src/
│   ├── components/
│   │   ├── ProfileEditModal.tsx  # Upload UI
│   │   └── PostCard.tsx          # Display profile images
│   ├── lib/
│   │   └── api.ts             # Upload API calls
│   └── pages/
│       ├── Home.tsx           # Profile image in sidebar
│       └── Profile.tsx        # Profile page display
└── PROFILE_IMAGE_SETUP.md     # This guide
```

## Troubleshooting

### Common Issues
1. **Upload fails**: Check Cloudinary credentials in `.env`
2. **Images not displaying**: Verify API endpoints are running
3. **File too large**: Ensure files are under 5MB for profile images

### Error Messages
- "Please upload an image file": Only image files are accepted
- "Failed to upload profile image": Check network connection and credentials
- File size warnings: Reduce image size before uploading

## Next Steps
- Add drag & drop functionality to profile image area
- Implement image cropping tool
- Add progress indicators for large uploads
- Support for video profile pictures