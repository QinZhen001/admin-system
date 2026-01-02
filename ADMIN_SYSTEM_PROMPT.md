# 全栈后台管理系统框架搭建提示词

## 项目概述
请帮我搭建一个现代化的全栈后台管理系统框架，具备完整的前后端功能、用户认证、权限管理和常见的管理功能模块。

## 技术栈要求

### 前端技术栈
- **框架**: React 18+ with TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: Redux Toolkit
- **UI 组件库**: Ant Design 和 ant-design/pro-components 和 @ant-design/icons
- **HTTP 客户端**: Axios
- **表单处理**: React Hook Form + Zod 验证
- **样式方案**: Less
- **图表库**:  ECharts

### 后端技术栈
- **运行环境**: Node.js 20+
- **框架**: Express.js 或 Nest.js
- **语言**: TypeScript
- **数据库**:  MySQL
- **ORM**:  TypeORM
- **认证**: JWT 
- **验证**: class-validator 或 Joi
- **API 文档**: Swagger
- **日志**: Winston 或 Pino

### 开发工具
- **代码规范**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **API 测试**: Postman 集合或 REST Client
- **容器化**: Docker + Docker Compose

## 核心功能模块

### 1. 用户认证系统
- [ ] 登录页面（用户名/邮箱 + 密码）
- [ ] 注册功能（可选）
- [ ] 忘记密码/重置密码
- [ ] JWT Token 认证
- [ ] Refresh Token 刷新机制
- [ ] 登出功能
- [ ] 记住我功能
- [ ] 登录状态持久化

### 2. 权限管理系统 (RBAC)
- [ ] 用户管理（CRUD）
- [ ] 角色管理（CRUD）
- [ ] 权限管理（菜单权限、按钮权限、数据权限）
- [ ] 角色-权限关联
- [ ] 用户-角色关联
- [ ] 前端路由权限控制
- [ ] 后端 API 权限中间件
- [ ] 动态菜单生成

### 3. 系统管理
- [ ] 部门管理（树形结构）
- [ ] 菜单管理（树形结构，可配置路由、图标）
- [ ] 字典管理（系统配置项）
- [ ] 操作日志（用户操作记录）
- [ ] 登录日志（登录历史记录）
- [ ] 系统监控（服务器状态、API 调用统计）

### 4. 个人中心
- [ ] 个人信息查看
- [ ] 修改个人信息
- [ ] 修改密码
- [ ] 头像上传
- [ ] 主题切换（深色/浅色模式）
- [ ] 语言切换（国际化）

## 数据库设计

### 核心表结构

```sql
-- 用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(255),
  phone VARCHAR(20),
  status SMALLINT DEFAULT 1, -- 1:启用 0:禁用
  department_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- 角色表
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  sort INTEGER DEFAULT 0,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 权限/菜单表
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER DEFAULT 0,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  type SMALLINT, -- 1:菜单 2:按钮 3:接口
  path VARCHAR(200),
  component VARCHAR(200),
  icon VARCHAR(50),
  sort INTEGER DEFAULT 0,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户角色关联表
CREATE TABLE user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

-- 角色权限关联表
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

-- 部门表
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER DEFAULT 0,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  leader VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  sort INTEGER DEFAULT 0,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 操作日志表
CREATE TABLE operation_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  username VARCHAR(50),
  module VARCHAR(50),
  action VARCHAR(50),
  method VARCHAR(10),
  url VARCHAR(255),
  ip VARCHAR(50),
  location VARCHAR(100),
  params TEXT,
  result TEXT,
  error_msg TEXT,
  duration INTEGER, -- 毫秒
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API 接口设计规范

### 统一响应格式
```typescript
interface ApiResponse<T = any> {
  code: number;        // 状态码: 200 成功, 其他失败
  message: string;     // 提示信息
  data?: T;            // 响应数据
  timestamp: number;   // 时间戳
}

interface PageResponse<T = any> {
  list: T[];          // 数据列表
  total: number;      // 总数
  page: number;       // 当前页
  pageSize: number;   // 每页数量
}
```

### RESTful API 规范
```
# 认证相关
POST   /api/auth/login           # 登录
POST   /api/auth/logout          # 登出
POST   /api/auth/refresh         # 刷新token
GET    /api/auth/profile         # 获取当前用户信息

# 用户管理
GET    /api/users                # 获取用户列表
GET    /api/users/:id            # 获取用户详情
POST   /api/users                # 创建用户
PUT    /api/users/:id            # 更新用户
DELETE /api/users/:id            # 删除用户
PATCH  /api/users/:id/status     # 修改用户状态
PUT    /api/users/:id/password   # 修改密码

# 角色管理
GET    /api/roles                # 获取角色列表
GET    /api/roles/:id            # 获取角色详情
POST   /api/roles                # 创建角色
PUT    /api/roles/:id            # 更新角色
DELETE /api/roles/:id            # 删除角色
GET    /api/roles/:id/permissions # 获取角色权限
PUT    /api/roles/:id/permissions # 分配角色权限

# 权限/菜单管理
GET    /api/permissions          # 获取权限列表（树形）
GET    /api/permissions/:id      # 获取权限详情
POST   /api/permissions          # 创建权限
PUT    /api/permissions/:id      # 更新权限
DELETE /api/permissions/:id      # 删除权限
GET    /api/permissions/tree     # 获取权限树

# 部门管理
GET    /api/departments          # 获取部门列表（树形）
GET    /api/departments/:id      # 获取部门详情
POST   /api/departments          # 创建部门
PUT    /api/departments/:id      # 更新部门
DELETE /api/departments/:id      # 删除部门

# 日志管理
GET    /api/logs/operation       # 获取操作日志
GET    /api/logs/login           # 获取登录日志
```

## 前端架构设计

### 目录结构
```
src/
├── api/                    # API 接口
│   ├── auth.ts
│   ├── user.ts
│   ├── role.ts
│   └── ...
├── assets/                 # 静态资源
│   ├── images/
│   └── styles/
├── components/             # 通用组件
│   ├── Layout/            # 布局组件
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── AuthGuard/         # 权限守卫
│   ├── Table/             # 封装表格
│   ├── Modal/             # 封装弹窗
│   └── ...
├── config/                 # 配置文件
│   ├── constants.ts
│   └── routes.tsx
├── hooks/                  # 自定义 Hooks
│   ├── useAuth.ts
│   ├── usePermission.ts
│   └── useTable.ts
├── pages/                  # 页面组件
│   ├── Login/
│   ├── Dashboard/
│   ├── System/
│   │   ├── User/
│   │   ├── Role/
│   │   ├── Permission/
│   │   └── Department/
│   └── Profile/
├── stores/                 # 状态管理
│   ├── authStore.ts
│   ├── userStore.ts
│   └── appStore.ts
├── types/                  # TypeScript 类型
│   ├── api.ts
│   ├── user.ts
│   └── ...
├── utils/                  # 工具函数
│   ├── request.ts         # Axios 封装
│   ├── storage.ts         # 本地存储
│   ├── auth.ts            # 认证工具
│   └── ...
├── App.tsx
└── main.tsx
```

### 关键功能实现

#### 1. 路由配置与权限控制
```typescript
// 动态路由配置
export const routes = [
  {
    path: '/login',
    component: Login,
    meta: { requireAuth: false }
  },
  {
    path: '/',
    component: Layout,
    meta: { requireAuth: true },
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        meta: { title: '仪表盘', permission: 'dashboard:view' }
      },
      {
        path: 'system/user',
        component: UserManage,
        meta: { title: '用户管理', permission: 'system:user:view' }
      }
    ]
  }
];
```

#### 2. Axios 请求封装
```typescript
// 包含 Token 自动注入、错误处理、请求/响应拦截
// 实现 Token 过期自动刷新
// 统一错误提示
```

#### 3. 权限指令/组件
```typescript
// 按钮级权限控制
<PermissionButton permission="user:delete">删除</PermissionButton>

// 或使用 Hook
const hasPermission = usePermission('user:delete');
```

## 后端架构设计

### 目录结构（Express/Nest.js）
```
src/
├── config/                 # 配置
│   ├── database.ts
│   ├── jwt.ts
│   └── app.ts
├── controllers/            # 控制器
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   └── ...
├── services/               # 业务逻辑
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── ...
├── models/                 # 数据模型（如使用 Prisma 则为 prisma/schema.prisma）
│   ├── user.model.ts
│   └── ...
├── middlewares/            # 中间件
│   ├── auth.middleware.ts
│   ├── permission.middleware.ts
│   ├── error.middleware.ts
│   └── logger.middleware.ts
├── utils/                  # 工具函数
│   ├── bcrypt.ts
│   ├── jwt.ts
│   └── validator.ts
├── types/                  # TypeScript 类型
│   └── index.d.ts
├── routes/                 # 路由
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   └── index.ts
└── app.ts                  # 应用入口
```

### 关键功能实现

#### 1. JWT 认证中间件
```typescript
// 验证 Access Token
// 支持 Token 刷新
// 提取用户信息
```

#### 2. 权限验证中间件
```typescript
// 基于角色和权限的验证
// 支持多种权限验证策略
```

#### 3. 操作日志记录
```typescript
// 自动记录所有 API 调用
// 记录请求参数、响应结果、执行时间
```

## UI/UX 要求

### 布局
- 侧边栏导航（可折叠）
- 顶部导航栏（面包屑、用户信息、通知、全屏、设置）
- 多标签页（Tab）功能
- 响应式设计，支持移动端

### 主题
- 支持浅色/深色主题切换
- 支持主题色自定义
- 布局配置（固定 Header、固定 Sidebar 等）

### 交互
- 加载动画和骨架屏
- 表格虚拟滚动（大数据量）
- 表单实时验证
- 友好的错误提示
- 操作确认弹窗

### 仪表盘
- 数据统计卡片（用户数、订单数等）
- 图表展示（折线图、柱状图、饼图）
- 待办事项列表
- 最近操作记录

## 开发规范

### 代码规范
- 使用 ESLint + Prettier 统一代码风格
- 组件/函数命名采用驼峰式
- 常量使用大写下划线
- 所有接口和类型必须定义 TypeScript 类型
- 必要的注释和 JSDoc

### Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

### 安全性要求
- 密码必须加密存储（bcrypt）
- SQL 注入防护（使用 ORM 参数化查询）
- XSS 防护（输入验证和输出转义）
- CSRF 防护
- 敏感操作二次验证
- API 限流

## 部署要求

### Docker 容器化
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/admin
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=admin
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 环境配置
- 开发环境（.env.development）
- 生产环境（.env.production）
- 环境变量管理（数据库、JWT密钥等）


## 文档要求

请提供以下文档：
1. README.md - 项目说明和快速开始
2. API_DOCUMENTATION.md - 接口文档
3. DEPLOYMENT.md - 部署指南
4. DEVELOPMENT.md - 开发指南
5. DATABASE.md - 数据库设计文档

## 初始数据

请创建种子数据（seed）：
- 超级管理员账号：admin / admin123
- 基础角色：超级管理员、普通管理员、普通用户
- 基础权限和菜单配置
- 测试部门数据

## 额外功能（可选）

- [ ] 文件上传下载（本地/OSS）
- [ ] 导入导出（Excel）
- [ ] 消息通知系统（WebSocket）
- [ ] 数据字典管理
- [ ] 定时任务管理
- [ ] 邮件发送功能
- [ ] 短信验证码
- [ ] 第三方登录（GitHub/Google）
- [ ] 国际化多语言
- [ ] 在线用户管理
- [ ] 系统性能监控

## 实施步骤

1. **初始化项目**
   - 创建前后端项目结构
   - 配置开发环境
   - 安装依赖包

2. **数据库设计与实现**
   - 设计数据库表结构
   - 编写迁移文件
   - 创建种子数据

3. **后端核心功能**
   - 实现用户认证（登录/注册/JWT）
   - 实现权限中间件
   - 实现用户管理 CRUD
   - 实现角色管理 CRUD
   - 实现权限管理 CRUD

4. **前端核心功能**
   - 搭建布局框架
   - 实现登录页面
   - 实现路由和权限控制
   - 实现用户管理页面
   - 实现角色管理页面
   - 实现权限管理页面

5. **完善功能**
   - 实现日志记录
   - 实现仪表盘
   - 实现个人中心
   - 优化 UI/UX

6. **测试与部署**
   - 编写测试用例
   - Docker 容器化
   - 编写部署文档

## 验收标准

✅ 项目可以正常启动运行
✅ 登录/登出功能正常
✅ 权限控制生效（前端路由 + 后端 API）
✅ 用户、角色、权限 CRUD 功能完整
✅ 代码规范统一，有适当注释
✅ 数据库设计合理，有索引优化
✅ API 接口文档完整
✅ 响应式布局，支持移动端
✅ 错误处理完善，用户体验良好
✅ 包含 README 和部署文档

---

**注意事项**：
- 请使用最新稳定版本的技术栈
- 代码要有良好的可维护性和可扩展性
- 关注性能优化和安全性
- 遵循 DRY、SOLID 等编程原则
- 合理使用设计模式

