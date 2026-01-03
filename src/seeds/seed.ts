import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Role } from '../entity/Role';
import * as bcrypt from 'bcrypt';

/**
 * Seed Data Script
 * Populates the database with initial test data
 */

const seedRoles = [
  { name: 'admin', description: 'Administrator with full access' },
  { name: 'moderator', description: 'Moderator with limited administrative access' },
  { name: 'user', description: 'Regular user with basic access' },
  { name: 'guest', description: 'Guest user with read-only access' },
];

const seedUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    age: 30,
    isActive: true,
    roleNames: ['admin'],
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'john123',
    age: 25,
    isActive: true,
    roleNames: ['user'],
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'jane123',
    age: 28,
    isActive: true,
    roleNames: ['moderator', 'user'],
  },
  {
    username: 'bob_wilson',
    email: 'bob@example.com',
    password: 'bob123',
    age: 35,
    isActive: false,
    roleNames: ['user'],
  },
  {
    username: 'alice_wonder',
    email: 'alice@example.com',
    password: 'alice123',
    age: 22,
    isActive: true,
    roleNames: ['guest'],
  },
];

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(User);

    // Clear existing data (be careful in production!)
    console.log('🗑️  Clearing existing data...');
    await userRepository.createQueryBuilder().delete().execute();
    await roleRepository.createQueryBuilder().delete().execute();
    console.log('✅ Existing data cleared\n');

    // Seed roles
    console.log('📋 Seeding roles...');
    const createdRoles: Role[] = [];
    for (const roleData of seedRoles) {
      const role = roleRepository.create(roleData);
      const savedRole = await roleRepository.save(role);
      createdRoles.push(savedRole);
      console.log(`   ✅ Created role: ${savedRole.name}`);
    }
    console.log(`✅ ${createdRoles.length} roles created\n`);

    // Seed users
    console.log('👥 Seeding users...');
    for (const userData of seedUsers) {
      const { roleNames, ...userInfo } = userData;

      // Hash password manually for seed data
      const hashedPassword = await bcrypt.hash(userInfo.password, 10);

      // Create user without @BeforeInsert hook hashing
      const user = userRepository.create({
        ...userInfo,
        password: hashedPassword,
      });

      // Assign roles
      user.roles = createdRoles.filter((role) => roleNames.includes(role.name));

      await userRepository.save(user);
      console.log(`   ✅ Created user: ${user.username} (roles: ${roleNames.join(', ')})`);
    }
    console.log(`✅ ${seedUsers.length} users created\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Roles: ${createdRoles.length}`);
    console.log(`   - Users: ${seedUsers.length}`);
    console.log('\n🔐 Test credentials:');
    console.log('   - Admin: admin@example.com / admin123');
    console.log('   - User: john@example.com / john123');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run seed script
seed();
