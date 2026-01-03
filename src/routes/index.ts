import { Router } from 'express';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';

const router = Router();

/**
 * API Routes
 * Main router that combines all route modules
 */
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
