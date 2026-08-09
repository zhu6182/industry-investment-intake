# 产业投资进件系统 - 前端 (Frontend)

基于 Vue 3 + TypeScript + Vite 的前后端分离前端项目，支持 PC 端和移动端。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **语言**: TypeScript
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **UI 库 (PC端)**: Ant Design Vue
- **UI 库 (移动端)**: Vant
- **图表**: ECharts + vue-echarts
- **工具库**: dayjs

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

开发环境配置文件为 `.env.development`：

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=产业投资进件系统
```

### 3. 启动开发服务器

```bash
npm run dev
```

启动成功后，访问 `http://localhost:5173`

### 4. 构建生产版本

```bash
npm run build
```

### 5. 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── api/              # API 接口
│   └── modules/      # 按模块拆分的接口
├── assets/           # 静态资源
├── components/       # 公共组件
│   └── common/       # 通用组件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── styles/           # 全局样式
│   └── variables.css # CSS 变量
├── utils/            # 工具函数
│   └── request.ts    # Axios 封装
├── views/            # 页面视图
│   ├── pc/           # PC 端页面
│   └── mobile/       # 移动端页面
├── App.vue           # 根组件
├── main.ts           # 入口文件
└── style.css         # 全局样式
```

## 路径别名

`@` 映射到 `src/` 目录，例如：

```typescript
import { useUserStore } from '@/stores/user';
import request from '@/utils/request';
```

## License

MIT
