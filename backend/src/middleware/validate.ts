// ============================================================================
// ClaimShield AI - Zod Request Body/Query/Params Validation Middleware
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';

export enum ValidationSource {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
}

/**
 * Validates request data against a Zod schema
 * @param schema The Zod schema to validate against
 * @param source The part of the request to validate (body, query, params)
 */
export const validate = (schema: AnyZodObject, source: ValidationSource = ValidationSource.BODY) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      // Re-assign the parsed values to maintain types and clean up unmapped fields
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new AppError('Validation failed', 400, formattedErrors));
      }
      next(error);
    }
  };
};
