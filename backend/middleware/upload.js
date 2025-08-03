import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET &&
         process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
         process.env.CLOUDINARY_API_KEY !== 'your-api-key' &&
         process.env.CLOUDINARY_API_SECRET !== 'your-api-secret' &&
         process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
         process.env.CLOUDINARY_API_KEY !== 'test' &&
         process.env.CLOUDINARY_API_SECRET !== 'test';
};

// Configure Cloudinary only if properly configured
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Local storage configuration for fallback
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer storage for Cloudinary
const profileImageStorage = isCloudinaryConfigured() ? new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'linkedinn/profile-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' }
    ]
  }
}) : localStorage;

const coverPhotoStorage = isCloudinaryConfigured() ? new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'linkedinn/cover-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 300, crop: 'fill' },
      { quality: 'auto:good' }
    ]
  }
}) : localStorage;

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload only image files'), false);
  }
};

// Create multer instances
export const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('profileImage');

export const uploadCoverPhoto = multer({
  storage: coverPhotoStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('coverPhoto');

// Memory storage for local development fallback
const memoryStorage = multer.memoryStorage();

export const uploadToMemory = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export { cloudinary };