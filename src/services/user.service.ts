import { Repository, Like, FindManyOptions } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Role } from '../entity/Role';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto/user.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * User Service
 * Handles all business logic related to users
 */
export class UserService {
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  /**
   * Create a new user
   * @param createUserDto - User creation data
   * @returns Created user without password
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validate DTO
    const dto = plainToClass(CreateUserDto, createUserDto);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const messages = errors.map((e) => Object.values(e.constraints || {}).join(', ')).join('; ');
      throw new Error(`Validation failed: ${messages}`);
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // Create and save user
    const user = this.userRepository.create(createUserDto);
    // savedUser 不会包含 roles 关联数据，因为 save() 只返回保存的实体本身，不会自动加载关联关系。
    // 需要手动查询一次findById来获取 roles 关联数据。
    const savedUser = await this.userRepository.save(user);

    // Return user without password
    return this.findById(savedUser.id) as Promise<User>;
  }

  /**
   * Find all users with pagination and search
   * @param queryDto - Query parameters
   * @returns Paginated user list
   */
  async findAll(queryDto: UserQueryDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const whereConditions: FindManyOptions<User>['where'] = [];

    if (queryDto.search) {
      whereConditions.push(
        { username: Like(`%${queryDto.search}%`) },
        { email: Like(`%${queryDto.search}%`) },
      );
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: whereConditions.length > 0 ? whereConditions : undefined,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['roles'],
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find user by ID with roles
   * @param id - User ID
   * @returns User with roles or null
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  /**
   * Find user by email (including password for authentication)
   * @param email - User email
   * @returns User with password or null
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * Update user by ID
   * @param id - User ID
   * @param updateUserDto - Update data
   * @returns Updated user
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate DTO
    const dto = plainToClass(UpdateUserDto, updateUserDto);
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length > 0) {
      const messages = errors.map((e) => Object.values(e.constraints || {}).join(', ')).join('; ');
      throw new Error(`Validation failed: ${messages}`);
    }

    // Check username uniqueness if updating
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUsername) {
        throw new Error('Username already exists');
      }
    }

    // Check email uniqueness if updating
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    // Update user fields
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    return this.findById(id) as Promise<User>;
  }

  /**
   * Soft delete user by ID
   * @param id - User ID
   */
  async softDelete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.softDelete(id);
  }

  /**
   * Hard delete user by ID
   * @param id - User ID
   */
  async hardDelete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);
  }

  /**
   * Assign roles to user
   * @param userId - User ID
   * @param roleIds - Array of role IDs
   * @returns Updated user with roles
   */
  async assignRoles(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const roles = await this.roleRepository.findByIds(roleIds);
    // 推荐写法
    // findBy({
    //   id: In(roleIds)
    // });

    if (roles.length !== roleIds.length) {
      throw new Error('Some roles not found');
    }

    user.roles = roles;
    await this.userRepository.save(user);

    return this.findById(userId) as Promise<User>;
  }

  /**
   * Get active users count
   * @returns Number of active users
   */
  async getActiveUsersCount(): Promise<number> {
    return this.userRepository.count({
      where: { isActive: true },
    });
  }

  /**
   * Advanced query using QueryBuilder
   * Find users by multiple conditions
   */
  async findByAdvancedQuery(options: {
    isActive?: boolean;
    minAge?: number;
    maxAge?: number;
    roleNames?: string[];
  }): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role');

    if (options.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: options.isActive });
    }

    if (options.minAge !== undefined) {
      queryBuilder.andWhere('user.age >= :minAge', { minAge: options.minAge });
    }

    if (options.maxAge !== undefined) {
      queryBuilder.andWhere('user.age <= :maxAge', { maxAge: options.maxAge });
    }

    if (options.roleNames && options.roleNames.length > 0) {
      queryBuilder.andWhere('role.name IN (:...roleNames)', { roleNames: options.roleNames });
    }

    return queryBuilder.getMany();
  }

  /**
   * Batch create users with roles in a transaction
   */
  async batchCreateWithRoles(
    usersData: Array<{ userData: CreateUserDto; roleIds: number[] }>,
  ): Promise<User[]> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdUsers: User[] = [];

      for (const { userData, roleIds } of usersData) {
        // Create user
        const user = queryRunner.manager.create(User, userData);
        const savedUser = await queryRunner.manager.save(user);

        // Assign roles if provided
        if (roleIds.length > 0) {
          const roles = await queryRunner.manager.findByIds(Role, roleIds);
          savedUser.roles = roles;
          await queryRunner.manager.save(savedUser);
        }

        createdUsers.push(savedUser);
      }

      await queryRunner.commitTransaction();
      return createdUsers;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
