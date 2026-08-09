# 产业投资进件系统 - Industry Investment Intake System

基于 Vue 3 + NestJS 的产业投资进件系统，支持 PC 端 + 移动端。

## 技术栈

- **前端**: Vue 3 + Vite + TypeScript + Ant Design Vue + Vant + ECharts
- **后端**: NestJS 11 + TypeORM + PostgreSQL
- **认证**: JWT + Passport
- **AI**: 火山 Agent Plan MCP 企业核名

## 本地开发

### 启动后端

```bash
cd backend
npm install --legacy-peer-deps
npm run start:dev  # http://localhost:3000
```

### 启动前端

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev  # http://localhost:5173
```

## Render 部署

通过 `render.yaml` Blueprint 一键部署：

- **后端 API**: `https://industry-investment-intake-api.onrender.com`
- **前端**: `https://industry-investment-intake-web.onrender.com`
- **数据库**: Render PostgreSQL (Starter plan)
- **文件存储**: Render Persistent Disk (5GB) 挂载到 `/var/data`

### 部署步骤

1. 推送代码到 GitHub
2. 在 Render 控制台 → New → Blueprint → 选 GitHub repo
3. Render 自动读 `render.yaml` 创建 3 个资源：API + Frontend + Database
4. 等待 build 完成，URL 即可访问

### 关键环境变量

| 变量 | 来源 | 用途 |
|---|---|---|
| `DATABASE_URL` | Render 自动注入（fromDatabase） | PostgreSQL 连接 |
| `JWT_SECRET` | Render 自动生成 (generateValue) | JWT 签名密钥 |
| `UPLOAD_DIR` | render.yaml 写死 | `/var/data/uploads` |
| `PORT` | render.yaml 写死 | Render 默认 10000 |
| `CORS_ORIGINS` | render.yaml 写死 | 前端 URL |
| `VITE_API_BASE_URL` | render.yaml 写死 | 前端 build 时注入 |

## License

MIT
