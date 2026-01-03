# TypeORM + MySQL 项目初始化 Prompt

请帮我创建一个完整的 TypeORM + MySQL 项目，具体要求如下：

## 1. 项目基础配置

### 技术栈
- **Node.js** (TypeScript)
- **TypeORM** (最新稳定版)
- **MySQL2** (作为数据库驱动)
- **Express** (作为 Web 框架)
- **dotenv** (环境变量管理)

### 项目结构
```
admin-system/
├── src/
│   ├── entity/          # 实体类 (Entity)
│   ├── migration/       # 数据库迁移文件
│   ├── data-source.ts   # 数据源配置
│   ├── routes/          # 路由
│   ├── controllers/     # 控制器
│   ├── services/        # 业务逻辑层
│   └── index.ts         # 入口文件
├── .env                 # 环境变量
├── .env.example         # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 2. 数据库设计

### 实体要求
请创建以下实体（Entity）：

1. **User (用户表)**
   - id: 主键，自增
   - username: 用户名，唯一，非空
   - email: 邮箱，唯一，非空
   - password: 密码（加密存储），非空
   - age: 年龄，可选
   - isActive: 是否激活，默认 true
   - createdAt: 创建时间，自动生成
   - updatedAt: 更新时间，自动更新

2. **Role (角色表)**
   - id: 主键，自增
   - name: 角色名称，唯一，非空
   - description: 角色描述，可选
   - createdAt: 创建时间

3. **User-Role 关系**
   - 用户和角色之间是多对多关系
   - 需要使用 @ManyToMany 装饰器

## 3. 功能实现要求

### 数据源配置 (data-source.ts)
- 从环境变量读取数据库配置
- 配置项包括：host、port、username、password、database
- 启用 logging: true（开发环境）
- 启用 synchronize: true（开发环境，生产环境需关闭）
- 实体路径配置
- 迁移文件路径配置

### 基础 CRUD API
为 User 实体创建以下 RESTful API：

1. **POST /api/users** - 创建用户
   - 请求体：{ username, email, password, age? }
   - 密码需要使用 bcrypt 加密
   - 验证邮箱格式
   - 返回创建的用户信息（不包含密码）

2. **GET /api/users** - 获取所有用户列表
   - 支持分页：query 参数 page, limit
   - 支持搜索：query 参数 search（搜索用户名或邮箱）
   - 返回用户列表（不包含密码）

3. **GET /api/users/:id** - 获取单个用户详情
   - 包含用户的角色信息
   - 返回用户信息（不包含密码）

4. **PUT /api/users/:id** - 更新用户信息
   - 可更新字段：username, email, age, isActive
   - 验证数据有效性

5. **DELETE /api/users/:id** - 删除用户
   - 软删除（添加 deletedAt 字段）或硬删除

### 数据库操作示例
包含以下高级查询示例：

1. **关系查询** - 查询用户及其角色
2. **聚合查询** - 统计活跃用户数量
3. **条件查询** - 根据多个条件筛选用户
4. **事务处理** - 批量创建用户和角色的关联
5. **QueryBuilder** - 复杂查询示例

## 4. 配置文件要求

### package.json
包含以下脚本：
- `npm run dev` - 开发模式（使用 ts-node-dev）
- `npm run build` - 构建项目
- `npm run start` - 生产模式启动
- `npm run typeorm` - TypeORM CLI 命令
- `npm run migration:generate` - 生成迁移文件
- `npm run migration:run` - 运行迁移
- `npm run migration:revert` - 回滚迁移

### tsconfig.json
- target: ES2020 或以上
- module: commonjs
- 启用装饰器：experimentalDecorators, emitDecoratorMetadata
- 严格模式：strict: true
- 输出目录：dist

### .env.example
提供完整的环境变量示例：
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=admin_system

# Server
PORT=3000
NODE_ENV=development
```

## 5. 错误处理和验证

- 统一的错误处理中间件
- 使用 class-validator 进行 DTO 验证
- 数据库连接失败的错误处理
- 友好的错误信息返回

## 6. 文档要求

### README.md
包含以下内容：
1. 项目简介
2. 技术栈说明
3. 快速开始指南
   - 环境要求
   - 安装依赖
   - 数据库配置
   - 运行项目
4. API 文档（列出所有接口）
5. 数据库表结构说明
6. TypeORM 常用命令
7. 开发注意事项

## 7. 额外要求

- 代码需要有适当的注释
- 使用 async/await 处理异步操作
- 遵循 RESTful API 设计规范
- 所有时间字段使用 UTC 时间
- 使用 eslint 和 prettier 保持代码风格统一
- 提供数据库初始化脚本（可选）
- 添加一些种子数据（seed data）用于测试

## 8. 可选的进阶功能

如果时间允许，可以添加：
1. JWT 身份验证
2. 日志系统（winston）
3. 接口限流（rate limiting）
4. 数据缓存（Redis）
5. 接口文档（Swagger）

---

**开始实现前请确认：**
- [ ] 已安装 MySQL 并创建数据库
- [ ] 已安装 Node.js 20+ 版本
- [ ] 理解项目的整体架构和要求

请按照上述要求完整实现项目，并确保代码可以正常运行。