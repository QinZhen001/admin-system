import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, AssignRolesDto } from '../dto/user.dto';
import { logger } from '../utils/logger';

/**
 * User Controller
 * Handles HTTP requests for user-related operations
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Create a new user
   * POST /api/users
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createUserDto: CreateUserDto = req.body;
      const user = await this.userService.create(createUserDto);

      logger.info(`User created: ${user.username}`);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all users with pagination and search
   * GET /api/users
   */
  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryDto: UserQueryDto = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
        search: req.query.search as string,
      };

      const result = await this.userService.findAll(queryDto);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result.users,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await this.userService.findById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user by ID
   * PUT /api/users/:id
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const updateUserDto: UpdateUserDto = req.body;
      const user = await this.userService.update(id, updateUserDto);

      logger.info(`User updated: ${user.username}`);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user by ID (soft delete)
   * DELETE /api/users/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const hardDelete = req.query.hard === 'true';

      if (hardDelete) {
        await this.userService.hardDelete(id);
        logger.info(`User hard deleted: ${id}`);
      } else {
        await this.userService.softDelete(id);
        logger.info(`User soft deleted: ${id}`);
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Assign roles to user
   * POST /api/users/:id/roles
   */
  assignRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const { roleIds }: AssignRolesDto = req.body;
      const user = await this.userService.assignRoles(id, roleIds);

      logger.info(`Roles assigned to user: ${user.username}`);
      res.status(200).json({
        success: true,
        message: 'Roles assigned successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active users count
   * GET /api/users/stats/active-count
   */
  getActiveUsersCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.userService.getActiveUsersCount();

      res.status(200).json({
        success: true,
        message: 'Active users count retrieved successfully',
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Advanced search
   * GET /api/users/search/advanced
   */
  advancedSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options = {
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        minAge: req.query.minAge ? parseInt(req.query.minAge as string, 10) : undefined,
        maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string, 10) : undefined,
        roleNames: req.query.roleNames ? (req.query.roleNames as string).split(',') : undefined,
      };

      const users = await this.userService.findByAdvancedQuery(options);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };
}
