# Admin System

A complete TypeORM + MySQL admin system built with Express and TypeScript.

## 📚 Tech Stack

- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: MySQL
- **Validation**: class-validator, class-transformer
- **Authentication**: bcrypt (password hashing)
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_DATABASE=admin_system
   PORT=3000
   NODE_ENV=development
   ```

4. **Create the database**
   ```sql
   CREATE DATABASE admin_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Run the application**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm run build
   npm run start
   ```

6. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /api/health
```

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create a new user |
| GET | `/api/users` | Get all users (with pagination) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user (soft delete) |
| DELETE | `/api/users/:id?hard=true` | Delete user (hard delete) |
| POST | `/api/users/:id/roles` | Assign roles to user |
| GET | `/api/users/stats/active-count` | Get active users count |
| GET | `/api/users/search/advanced` | Advanced user search |

### Role Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roles` | Create a new role |
| GET | `/api/roles` | Get all roles |
| GET | `/api/roles/:id` | Get role by ID |
| PUT | `/api/roles/:id` | Update role |
| DELETE | `/api/roles/:id` | Delete role |
| GET | `/api/roles/:id/users-count` | Get users count for role |

### Request Examples

#### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123",
    "age": 25
  }'
```

#### Get Users with Pagination
```bash
curl "http://localhost:3000/api/users?page=1&limit=10&search=john"
```

#### Assign Roles to User
```bash
curl -X POST http://localhost:3000/api/users/1/roles \
  -H "Content-Type: application/json" \
  -d '{"roleIds": [1, 2]}'
```

#### Advanced Search
```bash
curl "http://localhost:3000/api/users/search/advanced?isActive=true&minAge=20&maxAge=30"
```

## 🗄️ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key, auto-increment |
| username | VARCHAR(100) | Unique username |
| email | VARCHAR(255) | Unique email |
| password | VARCHAR(255) | Hashed password |
| age | INT | Optional age |
| isActive | BOOLEAN | Active status (default: true) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |
| deletedAt | TIMESTAMP | Soft delete timestamp |

### Roles Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key, auto-increment |
| name | VARCHAR(100) | Unique role name |
| description | TEXT | Optional description |
| createdAt | TIMESTAMP | Creation timestamp |

### User_Roles Table (Junction)
| Column | Type | Description |
|--------|------|-------------|
| userId | INT | Foreign key to users |
| roleId | INT | Foreign key to roles |

## 🛠️ TypeORM Commands

```bash
# Generate a new migration
npm run migration:generate -- src/migration/MigrationName

# Run pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# TypeORM CLI (general)
npm run typeorm -- <command>
```

## 📁 Project Structure

```
admin-system/
├── src/
│   ├── controllers/      # HTTP request handlers
│   ├── dto/              # Data Transfer Objects
│   ├── entity/           # TypeORM entities
│   ├── middleware/       # Express middleware
│   ├── migration/        # Database migrations
│   ├── routes/           # API routes
│   ├── seeds/            # Seed data scripts
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── data-source.ts    # TypeORM configuration
│   └── index.ts          # Application entry point
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md             # This file
```

## ⚠️ Development Notes

1. **Synchronize Mode**: In development, `synchronize: true` auto-creates tables. **Disable in production** and use migrations instead.

2. **Password Hashing**: Passwords are automatically hashed using bcrypt before saving.

3. **Soft Delete**: Users are soft-deleted by default (sets `deletedAt`). Use `?hard=true` for permanent deletion.

4. **Rate Limiting**: API endpoints are rate-limited to 100 requests per 15 minutes per IP.

5. **Validation**: DTOs use class-validator for automatic validation.

6. **Logging**: Winston logger outputs to console (dev) and files (production).

## 🔧 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run seed` | Populate database with test data |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |

## 📝 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
