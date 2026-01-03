import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';

const router = Router();
const roleController = new RoleController();

/**
 * Role Routes
 * All routes are prefixed with /api/roles
 */

// Basic CRUD routes
router.post('/', roleController.create);
router.get('/', roleController.findAll);
router.get('/:id', roleController.findById);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.delete);

// Additional routes
router.get('/:id/users-count', roleController.getUsersCount);

export default router;
