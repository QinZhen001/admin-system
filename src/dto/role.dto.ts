import { IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO for creating a new role
 */
export class CreateRoleDto {
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @IsOptional()
  description?: string;
}

/**
 * DTO for updating an existing role
 */
export class UpdateRoleDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Role name cannot be empty' })
  name?: string;

  @IsOptional()
  description?: string;
}
