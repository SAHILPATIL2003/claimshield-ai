// ============================================================================
// ClaimShield AI - JSON Web Token Authentication Middleware
// ============================================================================

import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload, Role } from '../types';
import { AppError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'claimshield-super-secret-key-2026';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

/**
 * Generates a signed JWT token for a user session
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Authentication middleware that verifies JWT and attaches user payload to request.
 * In DEMO_MODE, it allows bypass if a custom header or query parameter is present.
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If we are in demo mode and there's no auth header, see if we can use a mock user
    if (DEMO_MODE) {
      req.user = {
        userId: 'demo-patient-uuid-1111',
        role: Role.PATIENT,
        mobileNumber: '+919999999999',
        fullName: 'Demo Patient (Bypassed)',
      };
      return next();
    }
    return next(new AppError('Access denied. No token provided.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (DEMO_MODE) {
      console.warn('Invalid JWT, but demo mode is enabled. Authenticating as demo user.');
      req.user = {
        userId: 'demo-patient-uuid-1111',
        role: Role.PATIENT,
        mobileNumber: '+919999999999',
        fullName: 'Demo Patient (Bypassed)',
      };
      return next();
    }
    return next(new AppError('Invalid or expired token.', 401));
  }
};
