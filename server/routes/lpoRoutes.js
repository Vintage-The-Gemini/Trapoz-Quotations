// server/routes/lpoRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getLPOs,
  getLPOById,
  recordLPO,
  updateLPO,
  deleteLPO,
  updateLPOStatus
} from '../controllers/lpoController.js';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads/lpo'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'lpo-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow only PDF, JPG, and PNG files
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
  }
});

const router = express.Router();

// Get all LPOs
router.get('/', getLPOs);

// Get single LPO by ID
router.get('/:id', getLPOById);

// Record a new LPO with optional file upload
router.post('/', upload.single('attachment'), recordLPO);

// Update LPO with optional file upload
router.put('/:id', upload.single('attachment'), updateLPO);

// Delete LPO
router.delete('/:id', deleteLPO);

// Update LPO status
router.patch('/:id/status', updateLPOStatus);

export default router;