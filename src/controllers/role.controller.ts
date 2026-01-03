import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { logger } from '../utils/logger';

/**
 * Role Controller
 * Handles HTTP requests for role-related operations
 */
export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  /**
   * Create a new role
   * POST /api/roles
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createRoleDto: CreateRoleDto = req.body;
      const role = await this.roleService.create(createRoleDto);

      logger.info(`Role created: ${role.name}`);
      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all roles
   * GET /api/roles
   */
  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.roleService.findAll();

      res.status(200).json({
        success: true,
        message: 'Roles retrieved successfully',
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get role by ID
   * GET /api/roles/:id
   */
  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const role = await this.roleService.findById(id);

      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Role retrieved successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update role by ID
   * PUT /api/roles/:id
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const updateRoleDto: UpdateRoleDto = req.body;
      const role = await this.roleService.update(id, updateRoleDto);

      logger.info(`Role updated: ${role.name}`);
      res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete role by ID
   * DELETE /api/roles/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.roleService.delete(id);

      logger.info(`Role deleted: ${id}`);
      res.status(200).json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get users count for a role
   * GET /api/roles/:id/users-count
   */
  getUsersCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const count = await this.roleService.getUsersCount(id);

      res.status(200).json({
        success: true,
        message: 'Users count retrieved successfully',
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  };
}
