import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload, { uploadImage } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', upload.single('profileImage'), uploadImage, register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profileImage'), uploadImage, updateProfile);

export default router;
