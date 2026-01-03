import winston from 'winston';
import { config } from 'dotenv';

config();

/**
 * Logger utility using Winston
 * Provides different log levels and transports based on environment
 */

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  }),
);

// Define transports based on environment
const transports: winston.transport[] = [
  // Console transport - always enabled
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat,
    ),
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
    }),
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logger
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
