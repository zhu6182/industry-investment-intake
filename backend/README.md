# 产业投资进件系统 - 后端 (Backend)

基于 NestJS + TypeScript + MySQL 的后端服务。

## 技术栈

- **框架**: NestJS 11
- **语言**: TypeScript (strict mode)
- **ORM**: TypeORM + MySQL
- **认证**: JWT + Passport
- **缓存**: Redis (ioredis)
- **文档生成**: Puppeteer / PDFKit / PptxJS / ExcelJS

## 环境要求

- Node.js >= 18
- MySQL >= 8.0
- Redis >= 6.0

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env` 文件并根据实际环境修改：

```bash
# .env 中的默认配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=industry_investment
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=industry-investment-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
FILE_STORAGE_PATH=./uploads
```

### 3. 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS industry_investment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动项目

```bash
# 开发模式 (热重载)
npm run start:dev

# 开发模式
npm run start

# 生产构建
npm run build

# 生产模式运行
npm run start:prod
```

启动成功后，服务运行在 `http://localhost:3000/api`

## 项目结构

```
src/
├── common/           # 公共模块
│   └── guards/       # 守卫 (JWT, Roles)
├── config/           # 配置模块
│   ├── database.config.ts
│   └── redis.config.ts
├── main.ts           # 入口文件
├── app.module.ts     # 根模块
├── app.controller.ts
└── app.service.ts
```

## API 前缀

所有 API 接口统一使用 `/api` 前缀，例如 `http://localhost:3000/api/users`

## License

MIT
