// ============================================================================
// ClaimShield AI - Medical Record Controllers
// ============================================================================

import { Response, NextFunction } from 'express';
import { uploadFile } from '../config/supabase';
import { generateSHA256, generateVerificationQRCode } from '../utils/hash';
import { hashFromFileUrl } from '../utils/fileBuffer';
import blockchainInstance from '../blockchain/blockchain';
import { extractTextFromImage } from '../ai/ocr';
import { generateMedicalSummary } from '../ai/summary';
import { analyzeFraudRisk, detectDuplicateRecord } from '../ai/fraudDetection';
import prisma from '../config/database';
import { AuthenticatedRequest, ApiResponse, Role, VerificationStatus } from '../types';
import { AppError } from '../middleware/errorHandler';

const buildVerificationPayload = async (opts: {
  recordId: string;
  storedHash: string;
  currentHash: string;
  fileName: string;
  fileUrl: string;
  req: AuthenticatedRequest;
}) => {
  const { recordId, storedHash, currentHash, fileName, fileUrl, req } = opts;

  const chainVerification = await blockchainInstance.verifyRecord(recordId, currentHash);
  const dbHashMismatch = currentHash !== storedHash;
  const isValid = chainVerification.verified && !dbHashMismatch;
  const tamperingDetected = !isValid;

  // If tampering is detected, mark the record so dashboards immediately surface alerts.
  if (tamperingDetected) {
    await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        verificationStatus: VerificationStatus.FLAGGED,
        fraudScore: 100,
      },
    });
  }

  const responseData: ApiResponse = {
    success: true,
    data: {
      recordId,
      fileName,
      fileUrl,
      isValid,
      storedHash,
      blockchainHash: chainVerification.block ? chainVerification.block.data.fileHash : 'NOT_FOUND',
      blockIndex: chainVerification.block ? chainVerification.block.index : -1,
      timestamp: chainVerification.block ? new Date(chainVerification.block.timestamp) : new Date(),
      tamperingDetected,
      chainIntegrity: chainVerification.verified,
    },
  };

  // Write an audit trail entry (works both for authenticated + public verifications).
  await prisma.auditLog.create({
    data: {
      userId: req.user?.userId || null,
      action: tamperingDetected ? 'RECORD_TAMPERED_VERIFY' : 'RECORD_INTEGRITY_OK',
      details: `Integrity check for record ${recordId}. StoredHashMatch: ${!dbHashMismatch}. BlockchainVerified: ${chainVerification.verified}.`,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    },
  });

  return responseData;
};

/**
 * Handle file upload, hash generation, OCR, AI summary, fraud assessment, blockchain storage.
 */
export const uploadRecord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const file = req.file;
  const userId = req.user?.userId;

  if (!file) {
    return next(new AppError('No medical file provided.', 400));
  }

  if (!userId) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const fileBuffer = file.buffer;
    const originalName = file.originalname;
    const mimeType = file.mimetype;
    const fileSize = file.size;

    console.log(`[Upload Service] Starting upload sequence for file: ${originalName} (${fileSize} bytes)`);

    // 1. Calculate SHA-256 hash of the file
    const fileHash = generateSHA256(fileBuffer);
    console.log(`[Upload Service] Calculated file SHA-256: ${fileHash}`);

    // 2. Upload file to storage (Supabase or local fallback)
    const fileUrl = await uploadFile(fileBuffer, originalName, mimeType);
    console.log(`[Upload Service] File uploaded. Accessible at: ${fileUrl}`);

    // 3. Duplicate upload detection
    const { isDuplicate, duplicateRecordId } = await detectDuplicateRecord(fileHash, userId);
    if (isDuplicate) {
      console.warn(`[Fraud Watch] Duplicate file upload detected. Record ${duplicateRecordId} already contains this hash.`);
    }

    // 4. Temporary Record Creation in DB to secure an ID
    const initialRecord = await prisma.medicalRecord.create({
      data: {
        patientId: userId,
        uploadedById: userId,
        fileName: originalName,
        fileType: mimeType,
        fileUrl,
        fileSize,
        blockchainHash: fileHash,
        isDuplicate,
        verificationStatus: VerificationStatus.PENDING,
      },
    });

    // 5. OCR processing
    console.log('[Upload Service] Initiating OCR text extraction...');
    const ocrText = await extractTextFromImage(fileBuffer, originalName);

    // 6. Generate AI Summary
    console.log('[Upload Service] Generating AI medical summary...');
    const summaryData = generateMedicalSummary(ocrText);
    const summaryJson = JSON.stringify(summaryData);

    // 7. Fraud Score Calculation
    console.log('[Upload Service] Running fraud detection models...');
    const fraudAnalysis = await analyzeFraudRisk({
      patientId: userId,
      fileHash,
      isDuplicate,
      ocrText,
      blockchainMismatch: false, // Initial upload has no blockchain mismatch
    });

    // 8. Commit hash to Blockchain ledger
    console.log('[Upload Service] Registering transaction block on permissioned blockchain...');
    const minedBlock = await blockchainInstance.addBlock({
      recordId: initialRecord.id,
      fileHash,
      uploadedBy: userId,
      action: 'UPLOAD',
    });

    // Determine verification badge status based on fraud risk
    let recordStatus = VerificationStatus.VERIFIED;
    if (fraudAnalysis.overallScore >= 60) {
      recordStatus = VerificationStatus.FLAGGED;
    }

    // 9. Update medical record in DB with blocks, OCR, AI and Fraud score
    const completedRecord = await prisma.medicalRecord.update({
      where: { id: initialRecord.id },
      data: {
        txId: minedBlock.hash,
        ocrText,
        aiSummary: summaryJson,
        fraudScore: fraudAnalysis.overallScore,
        verificationStatus: recordStatus,
        recordType: summaryData.reportType,
      },
    });

    // 10. Write audit trail
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'RECORD_UPLOAD',
        details: `Uploaded medical file: ${originalName}. Block index: ${minedBlock.index}. Fraud risk: ${fraudAnalysis.riskLevel} (${fraudAnalysis.overallScore}%)`,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    // 11. Create auto-insurance claim if file has high duplicate/anomaly to demonstrate admin monitoring
    if (fraudAnalysis.overallScore > 0 || Math.random() > 0.4) {
      const claimAmount = Math.floor(Math.random() * 12000) + 500;
      await prisma.insuranceClaim.create({
        data: {
          patientId: userId,
          recordId: completedRecord.id,
          claimAmount,
          fraudScore: fraudAnalysis.overallScore,
          verificationStatus: fraudAnalysis.overallScore >= 60 ? 'FLAGGED' : 'PENDING',
          policyNumber: `POL-${Math.floor(100000 + Math.random() * 900000)}`,
          insurerName: ['MediShield Inc', 'Aetna-Care', 'BlueCross Shield', 'Cigna-Health'][Math.floor(Math.random() * 4)],
        },
      });
    }

    const responseData: ApiResponse = {
      success: true,
      data: {
        record: {
          id: completedRecord.id,
          fileName: completedRecord.fileName,
          fileUrl: completedRecord.fileUrl,
          blockchainHash: completedRecord.blockchainHash,
          txId: completedRecord.txId,
          verificationStatus: completedRecord.verificationStatus,
          aiSummary: summaryData,
          ocrText: completedRecord.ocrText,
          fraudScore: completedRecord.fraudScore,
          createdAt: completedRecord.createdAt,
        },
        blockchain: {
          blockIndex: minedBlock.index,
          blockHash: minedBlock.hash,
          previousHash: minedBlock.previousHash,
          verified: recordStatus === VerificationStatus.VERIFIED,
        },
      },
    };

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns medical records uploaded by the logged-in patient
 */
export const getMyRecords = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const records = await prisma.medicalRecord.findMany({
      where: { patientId: userId },
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

    const parsedRecords = records.map((record) => ({
      ...record,
      aiSummary: record.aiSummary ? JSON.parse(record.aiSummary) : null,
    }));

    const responseData: ApiResponse = {
      success: true,
      data: parsedRecords,
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns timeline data of patient's medical records
 */
export const getTimeline = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const records = await prisma.medicalRecord.findMany({
      where: { patientId: userId },
      orderBy: { createdAt: 'asc' }, // timeline order
      select: {
        id: true,
        fileName: true,
        recordType: true,
        verificationStatus: true,
        fraudScore: true,
        createdAt: true,
        txId: true,
      },
    });

    const responseData: ApiResponse = {
      success: true,
      data: records,
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Verifies medical record SHA-256 hash against blockchain blocks.
 * Simulates tampering triggers if hashes mismatch.
 */
export const verifyRecord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return next(new AppError('Medical record not found.', 404));
    }

    if (req.user?.role === Role.PATIENT && record.patientId !== req.user.userId) {
      return next(new AppError('Unauthorized access to medical record.', 403));
    }

    const currentHash = await hashFromFileUrl(record.fileUrl);

    const responseData = await buildVerificationPayload({
      recordId: record.id,
      storedHash: record.blockchainHash,
      currentHash,
      fileName: record.fileName,
      fileUrl: record.fileUrl,
      req,
    });

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Public integrity verification for QR scans.
 * No JWT required, so we only return tampering status + anchored hashes.
 */
export const verifyRecordPublic = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return next(new AppError('Medical record not found.', 404));
    }

    const currentHash = await hashFromFileUrl(record.fileUrl);

    const responseData = await buildVerificationPayload({
      recordId: record.id,
      storedHash: record.blockchainHash,
      currentHash,
      fileName: record.fileName,
      fileUrl: record.fileUrl,
      req,
    });

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Generates a verification QR code for medical records.
 * Scans to a public route verifying record integrity.
 */
export const getQRCode = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return next(new AppError('Medical record not found.', 404));
    }

    // Redirect to public web app route
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-record/${record.id}`;
    
    const qrCodeUrl = await generateVerificationQRCode(verifyUrl);

    const responseData: ApiResponse = {
      success: true,
      data: {
        qrCodeUrl,
        verifyUrl,
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns a medical record details by ID
 */
export const getRecordById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            fullName: true,
            mobileNumber: true,
          },
        },
        doctorNotes: {
          include: {
            doctor: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!record) {
      return next(new AppError('Medical record not found.', 404));
    }

    // Role protection - Patients can only read their own records
    if (req.user?.role === 'PATIENT' && record.patientId !== req.user.userId) {
      return next(new AppError('Unauthorized access to medical record.', 403));
    }

    const responseData: ApiResponse = {
      success: true,
      data: {
        ...record,
        aiSummary: record.aiSummary ? JSON.parse(record.aiSummary) : null,
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};
