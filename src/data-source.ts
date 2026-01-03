import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entity/User';
import { Role } from './entity/Role';

// Load environment variables
config();

/**
 * TypeORM DataSource configuration
 * Reads database configuration from environment variables
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'admin_system',
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync in development only
  logging: process.env.NODE_ENV === 'development', // Enable logging in development
  entities: [User, Role],
  migrations: ['src/migration/**/*.ts'],
  subscribers: [],
  // MySQL specific options
  charset: 'utf8mb4',
  timezone: 'Z', // Use UTC timezone
  // Connection pool settings
  poolSize: 10,
  extra: {
    connectionLimit: 10,
  },
});
