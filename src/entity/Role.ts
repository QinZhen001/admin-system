import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { User } from './User';

/**
 * Role Entity
 * Represents a role that can be assigned to users
 */
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /**
   * Many-to-Many relationship with User
   * A role can be assigned to multiple users
   */
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
