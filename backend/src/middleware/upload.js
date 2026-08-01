import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

// Ensure local uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, WEBP, and GIF images are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter
});

// Post-upload middleware to handle Cloudinary upload or local path attachment
export const uploadImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'recipebox',
        transformation: [{ width: 800, height: 600, crop: 'limit' }]
      });
      // Clean up temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }
      req.fileUrl = result.secure_url;
    } else {
      // Local fallback url path
      const protocol = req.protocol;
      const host = req.get('host');
      req.fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }
    next();
  } catch (error) {
    console.error('Image upload failed in middleware:', error);
    // Cleanup local temp file if Cloudinary upload failed
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (err) {
      console.error('Error cleaning up file after failure:', err);
    }
    return res.status(500).json({ message: 'Image upload process failed', error: error.message });
  }
};

export default upload;
