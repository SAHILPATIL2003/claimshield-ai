// ============================================================================
// ClaimShield AI - Authentication API Controllers
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { generateToken } from '../middleware/auth';
import { getFirebaseAdmin } from '../config/firebase';
import prisma from '../config/database';
import { ApiResponse, Role, AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

/**
 * Helper to register an audit log action
 */
const createAuditLog = async (userId: string | null, action: string, details: string, req: Request) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

/**
 * Verifies Firebase OTP ID Token and issues a session JWT.
 * Creates user record in PostgreSQL if they do not exist.
 */
export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { firebaseToken } = req.body;

  if (!firebaseToken) {
    return next(new AppError('Firebase ID Token is required.', 400));
  }

  let mobileNumber = '';
  let firebaseUid = '';

  try {
    if (DEMO_MODE) {
      // Decode firebase token without verify in demo mode or construct mock
      console.log('[Auth Service] Firebase check bypassed in DEMO_MODE.');
      if (firebaseToken.startsWith('mock-')) {
        const parts = firebaseToken.split('-');
        mobileNumber = parts[1] || '+919999999999';
        firebaseUid = `mock-uid-${mobileNumber}`;
      } else {
        mobileNumber = '+919999999999';
        firebaseUid = 'mock-uid-default';
      }
    } else {
      const admin = getFirebaseAdmin();
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      firebaseUid = decodedToken.uid;
      mobileNumber = decodedToken.phone_number || '';

      if (!mobileNumber) {
        return next(new AppError('Phone number not associated with Firebase token.', 400));
      }
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          mobileNumber,
          firebaseUid,
          fullName: 'New Patient',
          role: Role.PATIENT, // default role
        },
      });
      await createAuditLog(user.id, 'USER_REGISTER', `New user registered via phone: ${mobileNumber}`, req);
    } else {
      // Update Firebase UID if not set
      if (!user.firebaseUid) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid },
        });
      }
      await createAuditLog(user.id, 'USER_LOGIN', `User logged in: ${mobileNumber}`, req);
    }

    const token = generateToken({
      userId: user.id,
      role: user.role as Role,
      mobileNumber: user.mobileNumber,
      fullName: user.fullName,
    });

    const responseData: ApiResponse = {
      success: true,
      data: {
        token,
        isNewUser,
        user: {
          id: user.id,
          role: user.role,
          mobileNumber: user.mobileNumber,
          fullName: user.fullName,
          avatar: user.avatar,
          hospitalId: user.hospitalId,
        },
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('OTP Verification Error:', error);
    next(new AppError('Authentication failed. Invalid Firebase token.', 401));
  }
};

/**
 * Updates user profile details and assigns their structural role on first sign-in
 */
export const setRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { role, fullName, hospitalId } = req.body;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    return next(new AppError('Authentication required.', 401));
  }

  if (!role || !Object.values(Role).includes(role)) {
    return next(new AppError('Invalid role selection.', 400));
  }

  if (!fullName || fullName.trim().length < 2) {
    return next(new AppError('Full name must be at least 2 characters long.', 400));
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: currentUserId },
      data: {
        role,
        fullName: fullName.trim(),
        hospitalId: role === Role.DOCTOR ? hospitalId : null,
      },
    });

    // Re-generate JWT reflecting the updated fields
    const token = generateToken({
      userId: updatedUser.id,
      role: updatedUser.role as Role,
      mobileNumber: updatedUser.mobileNumber,
      fullName: updatedUser.fullName,
    });

    await createAuditLog(
      updatedUser.id,
      'UPDATE_ROLE',
      `Profile configured. Name: ${updatedUser.fullName}, Role: ${updatedUser.role}`,
      req
    );

    const responseData: ApiResponse = {
      success: true,
      data: {
        token,
        user: {
          id: updatedUser.id,
          role: updatedUser.role,
          mobileNumber: updatedUser.mobileNumber,
          fullName: updatedUser.fullName,
          avatar: updatedUser.avatar,
          hospitalId: updatedUser.hospitalId,
        },
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns current user's profile information
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hospital: true,
      },
    });

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    const responseData: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          role: user.role,
          mobileNumber: user.mobileNumber,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          hospitalId: user.hospitalId,
          hospitalName: user.hospital?.name || null,
        },
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Dev/Demo login helper endpoint. Generates a signed JWT session directly
 * using credentials matching the seed database, facilitating immediate tests.
 */
export const demoLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { mobileNumber, role, fullName } = req.body;

  if (!mobileNumber) {
    return next(new AppError('Mobile number is required for login.', 400));
  }

  try {
    // Find or create the user based on phone number
    let user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          mobileNumber,
          fullName: fullName || `Demo ${role || 'User'}`,
          role: (role as Role) || Role.PATIENT,
        },
      });
      await createAuditLog(user.id, 'USER_REGISTER', `Demo registration: ${mobileNumber}`, req);
    } else if (role && user.role !== role) {
      // Update role for testing flexibility
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: role as Role },
      });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role as Role,
      mobileNumber: user.mobileNumber,
      fullName: user.fullName,
    });

    await createAuditLog(user.id, 'USER_LOGIN', `Demo login: ${user.mobileNumber} (${user.role})`, req);

    const responseData: ApiResponse = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          role: user.role,
          mobileNumber: user.mobileNumber,
          fullName: user.fullName,
          avatar: user.avatar,
          hospitalId: user.hospitalId,
        },
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};
