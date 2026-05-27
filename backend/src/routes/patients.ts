// ============================================================================
// ClaimShield AI - Patient Lookup Routes (Doctor access)
// ============================================================================

import { Router } from 'express';
import { searchPatients, getPatientRecords, addDoctorNote } from '../controllers/patientController';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/roleGuard';
import { Role } from '../types';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const addNoteSchema = z.object({
  recordId: z.string().uuid('Invalid record ID format'),
  note: z.string().min(5, 'Observation note must be at least 5 characters long'),
});

// Doctors and Admins can access patient lookup routes
router.get('/', authenticate, requireRoles([Role.DOCTOR, Role.ADMIN]), searchPatients);
router.get('/:id/records', authenticate, requireRoles([Role.DOCTOR, Role.ADMIN]), getPatientRecords);

// Only Doctors can append clinical observation notes
router.post('/notes', authenticate, requireRoles([Role.DOCTOR]), validate(addNoteSchema), addDoctorNote);

export default router;
