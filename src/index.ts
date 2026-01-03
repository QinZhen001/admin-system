import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { AppDataSource } from './data-source';
import routes from './routes';
import { errorHandler, notFoundHandler, apiLimiter } from './middleware';
import { logger } from './utils/logger';

// Load environment variables
config();

/**
 * Initialize and start the Express application
 */
async function bootstrap(): Promise<void> {
  // Initialize Express app
  const app: Application = express();
  const PORT = process.env.PORT || 3000;

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Rate limiting
  app.use('/api', apiLimiter);

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // API routes
  app.use('/api', routes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Admin System API',
      version: '1.0.0',
      documentation: '/api/health',
    });
  });

  // Error handling middleware (must be after routes)
  app.use(notFoundHandler);
  app.use(errorHandler);

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established successfully');

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Error during application bootstrap:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
bootstrap();
