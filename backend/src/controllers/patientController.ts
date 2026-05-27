// ============================================================================
// ClaimShield AI - Patient Lookup & Medical Notes Controller (Doctor Role)
// ============================================================================

import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest, ApiResponse, Role } from '../types';
import { AppError } from '../middleware/errorHandler';

/**
 * Searches users with PATIENT role by name or mobile number
 */
export const searchPatients = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { query } = req.query;

  try {
    const patients = await prisma.user.findMany({
      where: {
        role: Role.PATIENT,
        isActive: true,
        ...(query && {
          OR: [
            { fullName: { contains: query as string, mode: 'insensitive' } },
            { mobileNumber: { contains: query as string } },
          ],
        }),
      },
      select: {
        id: true,
        fullName: true,
        mobileNumber: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { fullName: 'asc' },
    });

    const responseData: ApiResponse = {
      success: true,
      data: patients,
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves medical records for a specific patient (Doctor/Admin access only)
 */
export const getPatientRecords = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    const patient = await prisma.user.findUnique({
      where: { id },
      select: { fullName: true, mobileNumber: true },
    });

    if (!patient) {
      return next(new AppError('Patient not found.', 404));
    }

    const records = await prisma.medicalRecord.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        doctorNotes: {
          include: {
            doctor: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    const parsedRecords = records.map((r) => ({
      ...r,
      aiSummary: r.aiSummary ? JSON.parse(r.aiSummary) : null,
    }));

    // Audit logs for doctor reading medical reports
    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId || null,
        action: 'PATIENT_RECORD_VIEW',
        details: `Doctor/Admin reviewed files for patient ID ${id} (${patient.fullName})`,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    const responseData: ApiResponse = {
      success: true,
      data: {
        patient,
        records: parsedRecords,
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor appends professional observation notes onto an existing medical record.
 * Old doctor notes are read-only, patient files are immutable.
 */
export const addDoctorNote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { recordId, note } = req.body;
  const doctorId = req.user?.userId;

  if (!recordId || !note || note.trim().length === 0) {
    return next(new AppError('Record ID and note content are required.', 400));
  }

  if (!doctorId) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      return next(new AppError('Medical record not found.', 404));
    }

    // Append the observation note
    const doctorNote = await prisma.doctorNote.create({
      data: {
        recordId,
        doctorId,
        content: note.trim(),
      },
      include: {
        doctor: {
          select: { fullName: true },
        },
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: doctorId,
        action: 'DOCTOR_NOTE_ADD',
        details: `Doctor added notes on medical record ${recordId} for Patient ${record.patientId}`,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    const responseData: ApiResponse = {
      success: true,
      data: doctorNote,
      message: 'Observation note added successfully.',
    };

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};
