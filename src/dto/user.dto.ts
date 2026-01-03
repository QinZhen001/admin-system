import { IsEmail, IsNotEmpty, IsOptional, IsInt, Min, MinLength, IsBoolean } from 'class-validator';

/**
 * DTO for creating a new user
 */
export class CreateUserDto {
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsOptional()
  @IsInt({ message: 'Age must be an integer' })
  @Min(0, { message: 'Age must be a positive number' })
  age?: number;
}

/**
 * DTO for updating an existing user
 */
export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Username cannot be empty' })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsInt({ message: 'Age must be an integer' })
  @Min(0, { message: 'Age must be a positive number' })
  age?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

/**
 * DTO for user query parameters
 */
export class UserQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  search?: string;
}

/**
 * DTO for assigning roles to user
 */
export class AssignRolesDto {
  @IsNotEmpty({ message: 'Role IDs are required' })
  roleIds: number[];
}
