import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error Handler
 * Handles 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Global Error Handler
 * Handles all errors and sends appropriate response
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log the error
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle known ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Handle TypeORM errors
  if (err.name === 'QueryFailedError') {
    statusCode = 400;
    message = 'Database query failed';

    // Check for duplicate entry error
    if (err.message.includes('Duplicate entry')) {
      message = 'A record with this value already exists';
    }
  }

  // Handle validation errors
  if (err.message.startsWith('Validation failed')) {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  }

  // Handle common operational errors
  if (
    err.message.includes('not found') ||
    err.message.includes('Not found')
  ) {
    statusCode = 404;
    message = err.message;
    isOperational = true;
  }

  if (
    err.message.includes('already exists') ||
    err.message.includes('Already exists')
  ) {
    statusCode = 409;
    message = err.message;
    isOperational = true;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      isOperational,
    }),
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
