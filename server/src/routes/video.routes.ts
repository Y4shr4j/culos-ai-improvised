import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth';
import {
  uploadVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  toggleVideoBlur,
  incrementVideoViews
} from '../controllers/video.controller';

const router = express.Router();

// Configure multer for video uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Public routes
router.get('/', getVideos);
router.get('/:id', getVideoById);
router.post('/:id/view', incrementVideoViews);

// Protected admin routes
router.post('/upload', protect, upload.single('file'), uploadVideo);
router.put('/:id', protect, updateVideo);
router.delete('/:id', protect, deleteVideo);
router.patch('/:id/blur', protect, toggleVideoBlur);

export default router;