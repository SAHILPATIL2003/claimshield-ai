// ============================================================================
// ClaimShield AI - Role-Based Route Guard Middleware
// ============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Role } from '../types';
import { AppError } from './errorHandler';

/**
 * Middleware factory to guard routes by user roles.
 * Must be mounted AFTER the `authenticate` middleware.
 */
export const requireRoles = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return next(
        new AppError(
          `Access forbidden. Required role(s): ${allowedRoles.join(' or ')}. Your role: ${role}`,
          403
        )
      );
    }

    next();
  };
};
