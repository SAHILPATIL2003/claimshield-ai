// ============================================================================
// ClaimShield AI - Medical Record Routes
// ============================================================================

import { Router } from 'express';
import multer from 'multer';
import {
  uploadRecord,
  getMyRecords,
  getTimeline,
  verifyRecord,
  verifyRecordPublic,
  getQRCode,
  getRecordById,
} from '../controllers/recordController';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/roleGuard';
import { Role } from '../types';

const router = Router();

// Set up Multer for memory uploads (files are hashed first, then sent to Supabase Storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum file size
  },
  fileFilter: (req, file, cb) => {
    // Restrict to images & PDFs
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF are supported.'));
    }
  },
});

// Patient specific routes
router.post(
  '/upload',
  authenticate,
  requireRoles([Role.PATIENT]),
  upload.single('medicalFile'),
  uploadRecord
);

router.get('/my', authenticate, requireRoles([Role.PATIENT]), getMyRecords);
router.get('/timeline', authenticate, requireRoles([Role.PATIENT]), getTimeline);

// Verification and lookup routes accessible by multiple authorized roles
router.get('/verify/:id', authenticate, verifyRecord);
router.get('/qr/:id', authenticate, getQRCode);
router.get('/:id', authenticate, getRecordById);

// Public (QR) verification - no JWT required
router.get('/public/verify/:id', verifyRecordPublic);

export default router;
