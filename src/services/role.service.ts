import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Role } from '../entity/Role';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Role Service
 * Handles all business logic related to roles
 */
export class RoleService {
  private roleRepository: Repository<Role>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  /**
   * Create a new role
   * @param createRoleDto - Role creation data
   * @returns Created role
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Validate DTO
    const dto = plainToClass(CreateRoleDto, createRoleDto);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const messages = errors.map((e) => Object.values(e.constraints || {}).join(', ')).join('; ');
      throw new Error(`Validation failed: ${messages}`);
    }

    // Check if role name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (existingRole) {
      throw new Error('Role name already exists');
    }
    // create:
    // 只在内存中创建一个实体实例,不会与数据库交互,会根据实体的定义进行类型转换和属性映射
    const role = this.roleRepository.create(createRoleDto);
    // save:
    // 将实体真正保存到数据库,如果实体有主键且已存在，则执行 UPDATE
    // 如果实体没有主键或不存在，则执行 INSERT
    // 返回保存后的实体（包含数据库生成的字段如 id、createdAt 等）
    return this.roleRepository.save(role);
  }

  /**
   * Find all roles
   * @returns Array of roles
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find role by ID
   * @param id - Role ID
   * @returns Role or null
   */
  async findById(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  /**
   * Find role by name
   * @param name - Role name
   * @returns Role or null
   */
  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
    });
  }

  /**
   * Update role by ID
   * @param id - Role ID
   * @param updateRoleDto - Update data
   * @returns Updated role
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    // Validate DTO
    const dto = plainToClass(UpdateRoleDto, updateRoleDto);
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length > 0) {
      const messages = errors.map((e) => Object.values(e.constraints || {}).join(', ')).join('; ');
      throw new Error(`Validation failed: ${messages}`);
    }

    // Check role name uniqueness if updating
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existingRole) {
        throw new Error('Role name already exists');
      }
    }

    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  /**
   * Delete role by ID
   * @param id - Role ID
   */
  async delete(id: number): Promise<void> {
    const role = await this.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    await this.roleRepository.delete(id);
  }

  /**
   * Get users count for a role
   * @param id - Role ID
   * @returns Number of users with this role
   */
  async getUsersCount(id: number): Promise<number> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    return role?.users?.length || 0;
  }
}
