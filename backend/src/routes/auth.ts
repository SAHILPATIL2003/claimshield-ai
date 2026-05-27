// ============================================================================
// ClaimShield AI - Authentication Routes
// ============================================================================

import { Router } from 'express';
import { verifyOTP, setRole, getMe, demoLogin } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate, ValidationSource } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Zod validation schemas
const verifyOTPSchema = z.object({
  firebaseToken: z.string().min(1, 'Firebase token is required'),
});

const setRoleSchema = z.object({
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  hospitalId: z.string().optional(),
});

const demoLoginSchema = z.object({
  mobileNumber: z.string().min(10, 'Mobile number must be valid'),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

// Auth API Endpoints
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);
router.post('/demo-login', validate(demoLoginSchema), demoLogin);
router.post('/set-role', authenticate, validate(setRoleSchema), setRole);
router.get('/me', authenticate, getMe);

export default router;
