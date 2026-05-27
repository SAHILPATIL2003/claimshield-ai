// ============================================================================
// ClaimShield AI - Global Express Error Handler Middleware
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public errors?: any;

  constructor(message: string, statusCode: number = 500, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[Error Log] Path: ${req.path} | Method: ${req.method}`);
  console.error(error);

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error.message || 'Internal Server Error';
  const errors = error instanceof AppError ? error.errors : undefined;

  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { error: JSON.stringify(errors) }),
    // Include stack trace only in local dev environment
    ...(process.env.NODE_ENV === 'development' && { error: error.stack }),
  };

  res.status(statusCode).json(response);
};
