// ============================================================================
// ClaimShield AI - Admin Dashboard & Analytics Routes
// ============================================================================

import { Router } from 'express';
import {
  getAnalytics,
  getUsers,
  updateUser,
  deleteUser,
  getFraudData,
  getBlockchainLedger,
  getAuditLogs,
  getClaims,
  updateClaim,
  deleteRecord,
  getHospitals,
  createHospital,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/roleGuard';
import { Role } from '../types';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Zod schemas for validation
const updateUserSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum([Role.PATIENT, Role.DOCTOR, Role.ADMIN]),
  isActive: z.boolean(),
  hospitalId: z.string().nullable().optional(),
});

const updateClaimSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'FLAGGED']),
  notes: z.string().min(5, 'Review remarks must be at least 5 characters long'),
});

const createHospitalSchema = z.object({
  name: z.string().min(3, 'Hospital name must be at least 3 characters'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  adminId: z.string().uuid('Invalid admin user ID').optional().nullable(),
});

// Guard all endpoints in this router to ADMIN role
router.use(authenticate, requireRoles([Role.ADMIN]));

router.get('/analytics', getAnalytics);

// User Management CRUD
router.get('/users', getUsers);
router.patch('/users/:id', validate(updateUserSchema), updateUser);
router.delete('/users/:id', deleteUser);

// Fraud Monitoring and Blockchain Ledger
router.get('/fraud', getFraudData);
router.get('/blockchain', getBlockchainLedger);
router.get('/logs', getAuditLogs);

// Claim Audits
router.get('/claims', getClaims);
router.patch('/claims/:id', validate(updateClaimSchema), updateClaim);

// Audited deletion of erroneous files
router.delete('/records/:id', deleteRecord);

// Hospital Management
router.get('/hospitals', getHospitals);
router.post('/hospitals', validate(createHospitalSchema), createHospital);

export default router;
