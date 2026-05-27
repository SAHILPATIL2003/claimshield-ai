// ============================================================================
// ClaimShield AI - Admin Dashboard & Analytics Controller (Admin Role)
// ============================================================================

import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import blockchainInstance from '../blockchain/blockchain';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';

/**
 * Aggregates statistics and time-series data for the dashboard charts
 */
export const getAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalRecords = await prisma.medicalRecord.count();
    const totalClaims = await prisma.insuranceClaim.count();
    const totalBlockchainBlocks = await prisma.blockchainBlock.count();

    const fraudAlerts = await prisma.medicalRecord.count({
      where: { fraudScore: { gte: 60 } },
    });

    const verifiedRecords = await prisma.medicalRecord.count({
      where: { verificationStatus: 'VERIFIED' },
    });

    const flaggedRecords = await prisma.medicalRecord.count({
      where: { verificationStatus: 'FLAGGED' },
    });

    const pendingClaims = await prisma.insuranceClaim.count({
      where: { verificationStatus: 'PENDING' },
    });

    // Recent Audit Logs
    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        user: {
          select: { fullName: true, role: true },
        },
      },
    });

    // Time-series records by month (for charts)
    const records = await prisma.medicalRecord.findMany({
      select: { createdAt: true },
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = Array(12).fill(0);
    records.forEach((r) => {
      const month = r.createdAt.getMonth();
      monthlyCounts[month]++;
    });

    const recordsByMonth = months.map((month, idx) => ({
      month,
      count: monthlyCounts[idx],
    }));

    // Fraud score distribution
    const lowRisk = await prisma.medicalRecord.count({ where: { fraudScore: { lt: 30 } } });
    const medRisk = await prisma.medicalRecord.count({ where: { fraudScore: { gte: 30, lt: 60 } } });
    const highRisk = await prisma.medicalRecord.count({ where: { fraudScore: { gte: 60 } } });

    const fraudScoreDistribution = [
      { range: '0-30 (Low)', count: lowRisk },
      { range: '30-60 (Medium)', count: medRisk },
      { range: '60-100 (High)', count: highRisk },
    ];

    // Claims status distribution
    const pending = await prisma.insuranceClaim.count({ where: { verificationStatus: 'PENDING' } });
    const approved = await prisma.insuranceClaim.count({ where: { verificationStatus: 'APPROVED' } });
    const rejected = await prisma.insuranceClaim.count({ where: { verificationStatus: 'REJECTED' } });
    const flagged = await prisma.insuranceClaim.count({ where: { verificationStatus: 'FLAGGED' } });

    const claimsByStatus = [
      { status: 'Pending', count: pending },
      { status: 'Approved', count: approved },
      { status: 'Rejected', count: rejected },
      { status: 'Flagged', count: flagged },
    ];

    const responseData: ApiResponse = {
      success: true,
      data: {
        stats: {
          totalUsers,
          totalRecords,
          totalClaims,
          fraudAlerts,
          verifiedRecords,
          flaggedRecords,
          pendingClaims,
          totalBlockchainBlocks,
        },
        recentActivity,
        recordsByMonth,
        fraudScoreDistribution,
        claimsByStatus,
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns list of all system users
 */
export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { hospital: true },
    });

    const responseData: ApiResponse = {
      success: true,
      data: users,
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Modifies an existing user's configuration
 */
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { fullName, role, isActive, hospitalId } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        role,
        isActive,
        hospitalId: role === 'DOCTOR' ? hospitalId : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId || null,
        action: 'USER_UPDATE',
        details: `Updated details for user ${id} (${user.fullName}). Role: ${user.role}, Active: ${user.isActive}`,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    const responseData: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a user from the system
 */
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId || null,
        action: 'USER_DELETE',
        details: `Deleted user account ID ${id}`,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    const responseData: ApiResponse = {
      success: true,
      message: 'User deleted successfully.',
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves records flagged with high fraud indicators
 */
export const getFraudData = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const suspiciousRecords = await prisma.medicalRecord.findMany({
      where: {
        OR: [
          { fraudScore: { gte: 30 } },
          { verificationStatus: 'FLAGGED' },
          { isDuplicate: true },
        ],
      },
      include: {
        patient: { select: { fullName: true, mobileNumber: true } },
      },
      orderBy: { fraudScore: 'desc' },
    });

    const parsedRecords = suspiciousRecords.map((r) => ({
      ...r,
      aiSummary: r.aiSummary ? JSON.parse(r.aiSummary) : null,
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
 * Returns full blockchain ledger audit trail
 */
export const getBlockchainLedger = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chain = await blockchainInstance.getChain();
    
    // Check integrity of blockchain
    const { isValid, errorBlockIndex } = await blockchainInstance.isChainValid();

    const responseData: ApiResponse = {
      success: true,
      data: {
        chain,
        integrity: {
          isValid,
          errorBlockIndex: errorBlockIndex !== undefined ? errorBlockIndex : null,
        },
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns system action audit logs
 */
export const getAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, role: true } },
      },
    });

    const responseData: ApiResponse = {
      success: true,
      data: logs,
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns all submitted insurance claims
 */
export const getClaims = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const claims = await prisma.insuranceClaim.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { fullName: true, mobileNumber: true } },
        record: {
          select: {
            fileName: true,
            blockchainHash: true,
            verificationStatus: true,
          },
        },
      },
    });

    const responseData: ApiResponse = {
      success: true,
      data: claims,
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Adjusts insurance claim payout approval status
 */
export const updateClaim = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const adminId = req.user?.userId;

  try {
    const claim = await prisma.insuranceClaim.update({
      where: { id },
      data: {
        verificationStatus: status,
        notes,
        reviewedById: adminId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId || null,
        action: 'CLAIM_REVIEW',
        details: `Reviewed Insurance Claim ${id}. Decisions: ${status}`,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    const responseData: ApiResponse = {
      success: true,
      data: claim,
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a medical record (Admin-only capability for record corrections).
 * Note that blockchain block logs remain intact, making deletions auditable.
 */
export const deleteRecord = async (
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

    // Delete record from PostgreSQL (Supabase storage mock can remain or be deleted)
    await prisma.medicalRecord.delete({
      where: { id },
    });

    // Write deletion block to blockchain ledger to log the administrative delete action
    await blockchainInstance.addBlock({
      recordId: id,
      fileHash: record.blockchainHash,
      uploadedBy: req.user?.userId || 'ADMIN',
      action: 'DELETE',
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId || null,
        action: 'RECORD_DELETE',
        details: `Permanently deleted medical record ${id} (file: ${record.fileName}). Deletion committed to ledger chain.`,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    const responseData: ApiResponse = {
      success: true,
      message: 'Medical record deleted successfully. Deletion action written to block ledger.',
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns hospital entities
 */
export const getHospitals = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hospitals = await prisma.hospital.findMany({
      orderBy: { name: 'asc' },
      include: {
        admin: { select: { fullName: true } },
      },
    });

    const responseData: ApiResponse = {
      success: true,
      data: hospitals,
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new hospital profile
 */
export const createHospital = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, address, phone, email, adminId } = req.body;

  if (!name || name.trim().length === 0) {
    return next(new AppError('Hospital name is required.', 400));
  }

  try {
    const hospital = await prisma.hospital.create({
      data: {
        name: name.trim(),
        address,
        phone,
        email,
        adminId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId || null,
        action: 'HOSPITAL_CREATE',
        details: `Created new hospital record: ${hospital.name}`,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    const responseData: ApiResponse = {
      success: true,
      data: hospital,
    };

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};
