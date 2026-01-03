import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

/**
 * User Routes
 * All routes are prefixed with /api/users
 */

// Stats routes (must be before :id routes)
router.get('/stats/active-count', userController.getActiveUsersCount);
router.get('/search/advanced', userController.advancedSearch);

// Basic CRUD routes
router.post('/', userController.create);
router.get('/', userController.findAll);
router.get('/:id', userController.findById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

// Role assignment route
router.post('/:id/roles', userController.assignRoles);

export default router;
