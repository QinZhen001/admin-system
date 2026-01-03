import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Role } from './Role';

/**
 * User Entity
 * Represents a user in the system with authentication and profile information
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  /**
   * Many-to-Many relationship with Role
   * A user can have multiple roles
   */
  // cascade true: 自动将对父实体（如User）的操作（增、删、改）应用到其关联的子实体（如Role）。
  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  // 当两个实体之间存在多对多关系时，数据库无法直接将两张表关联。
  // 这时就需要一个中间表来记录这两个实体之间的关联关系
  @JoinTable({
    name: 'user_roles', // Junction table name
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  /**
   * Hash password before inserting new user
   */
  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.password) {
      const saltRounds = 10;
      // 密码加密
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  /**
   * Compare plain text password with hashed password
   */
  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  /**
   * Convert user to JSON without sensitive fields
   */
  toJSON() {
    // 去掉 password 隐私信息
    const { password, deletedAt, ...userWithoutSensitive } = this as User & { password?: string };
    return userWithoutSensitive;
  }
}
