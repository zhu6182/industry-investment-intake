# 角色权限实施计划

> 任务：为「产业投资进件系统」建立完整的角色权限体系（文档 + 核心实施）

## 一、目标

1. 生成一份**完整的角色权限文档**（`docs/PERMISSIONS.md`），覆盖 6 个角色 × 全部模块/接口/菜单，方便用户检查
2. **后端**补全各 controller 的 `@Roles` 注解，让 API 真正按角色拦截
3. **后端**实现 dataScope（自/团队/区域/全部）的数据范围过滤
4. **前端**在路由 meta 加 `roles/permissions` 字段，`router.beforeEach` 拦截；`App.vue` 菜单按角色过滤
5. 按钮级 v-permission 指令（**本次不做**，作为后续工作）

## 二、当前状态（基于代码实测）

### 后端
- ✅ `RolesGuard` (`backend/src/common/guards/roles.guard.ts`) 已存在，逻辑正确
- ✅ `Roles` / `Permissions` 装饰器已存在
- ✅ `Role.dataScope` 字段已定义（`self | team | region | all`）
- ✅ JWT strategy 已加载 `roles.permissions`
- ✅ seed.ts 已定义 6 个角色和 25 个权限
- ❌ **缺失**：intakes / follow-ups / visits / reviews / reports / dashboard / bi / tianyancha / upload 等 controller **未加 `@Roles`**
- ❌ **缺失**：findAll 等查询 **未按 dataScope 过滤**

### 前端
- ✅ `useUserStore` 已有 `roles / permissions / hasRole / hasPermission`
- ✅ 登录响应携带 `roles[]` 和 `permissions[]`
- ❌ **缺失**：路由 meta 无 roles/permissions 字段
- ❌ **缺失**：`router.beforeEach` 不检查角色
- ❌ **缺失**：`App.vue` 菜单硬编码全部显示

## 三、6 个角色

| code | 中文名（建议） | 旧中文 | dataScope | 主要职责 |
|---|---|---|---|---|
| `admin` | 超级管理员 | 系统管理员 | all | 全部权限 |
| `middleware_ops` | 中台运营 | 中台运营 | region | 审核 / BI / 园区 / 设置 |
| `investment_manager` | 投资负责人 | 投资经理 | region | 项目 / 评审 / 投资决策 |
| `investment_staff` | 投资专员 | 投资专员 | self | 项目尽调 / 创建评审 |
| `channel_manager` | 招商负责人 | 渠道主管 | team | 团队进件 / 跟进 / 拜访 / 推荐 |
| `channel_specialist` | 招商专员 | 渠道专员 | self | 录入进件 / 跟进 / 拜访 / 推荐 |

> ⚠️ 用户要求 `channel_specialist` 改为「招商专员」，`channel_manager` 改为「招商负责人」，`investment_staff/manager` 保持原名。本计划以**新中文名**为准，code 保持不变。

## 四、权限矩阵（设计建议）

> 此表既写进文档，也是后端 @Roles 的依据来源

| 权限 code | admin | 中台运营 | 投资负责人 | 投资专员 | 招商负责人 | 招商专员 |
|---|---|---|---|---|---|---|
| intake:view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅（仅 self） |
| intake:create | ✅ | – | – | – | ✅ | ✅ |
| intake:edit | ✅ | – | – | – | ✅（团队） | ✅（仅自己） |
| intake:delete | ✅ | – | – | – | ✅（团队） | – |
| intake:submit | ✅ | – | – | – | ✅ | ✅ |
| review:view | ✅ | ✅ | ✅ | ✅ | – | – |
| review:create | ✅ | ✅ | ✅ | ✅ | – | – |
| review:approve | ✅ | ✅ | ✅ | – | – | – |
| review:reject | ✅ | ✅ | ✅ | – | – | – |
| project:view | ✅ | ✅ | ✅ | ✅ | – | – |
| project:create | ✅ | – | ✅ | ✅ | – | – |
| project:edit | ✅ | – | ✅ | ✅ | – | – |
| project:delete | ✅ | – | ✅ | – | – | – |
| bi:view | ✅ | ✅ | ✅ | – | ✅ | – |
| bi:export | ✅ | ✅ | ✅ | – | – | – |
| user:view | ✅ | ✅ | – | – | – | – |
| user:create | ✅ | – | – | – | – | – |
| user:edit | ✅ | – | – | – | – | – |
| user:delete | ✅ | – | – | – | – | – |
| role:view | ✅ | – | – | – | – | – |
| role:create | ✅ | – | – | – | – | – |
| role:edit | ✅ | – | – | – | – | – |
| role:delete | ✅ | – | – | – | – | – |
| setting:view | ✅ | ✅ | – | – | – | – |
| setting:edit | ✅ | ✅ | – | – | – | – |

## 五、菜单权限（前端）

| 菜单 | 路由 | admin | 中台 | 投资负责人 | 投资专员 | 招商负责人 | 招商专员 |
|---|---|---|---|---|---|---|---|
| 工作台 | `/pc/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 团队工作台 | `/pc/dashboard/team` | ✅ | ✅ | ✅ | – | ✅ | – |
| 进件管理 | `/pc/intakes` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 新建进件 | `/pc/intakes/new` | ✅ | – | – | – | ✅ | ✅ |
| 中台审核 | `/pc/review` | ✅ | ✅ | ✅ | ✅ | – | – |
| 跟进记录 | `/pc/follow-ups` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 拜访记录 | `/pc/visits` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 数据大屏 | `/pc/bi` | ✅ | ✅ | ✅ | – | ✅ | – |
| 我的推荐 | `/pc/referrals` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 园区管理 | `/pc/admin/regions` | ✅ | ✅ | – | – | – | – |
| 用户管理 | `/pc/admin/users` | ✅ | ✅ | – | – | – | – |
| 角色权限 | `/pc/admin/roles` | ✅ | – | – | – | – | – |
| 系统设置 | `/pc/admin/settings` | ✅ | ✅ | – | – | – | – |

## 六、数据范围（dataScope）实现规则

| 角色 | scope | SQL 过滤 |
|---|---|---|
| `admin` | `all` | 不加过滤 |
| `middleware_ops` | `region` | `regionId = user.regionId`（或当前所选区域） |
| `investment_manager` | `region` | `regionId = user.regionId` |
| `investment_staff` | `self` | `createdBy = user.id` |
| `channel_manager` | `team` | `createdBy IN (teamMembers)` |
| `channel_specialist` | `self` | `createdBy = user.id` |

> 实施位置：编写一个 `applyDataScope(qb, user, alias)` 通用函数，在 `intakeService.findAll`、`followUpsService.findAll`、`visitsService.findAll` 等入口处调用。

## 七、具体改动

### 7.1 文档（必做）

**新增** `docs/PERMISSIONS.md`，包含：
1. 系统概述（6 角色 / dataScope / 权限模型）
2. 角色清单（含中文名 / code / dataScope / 职责）
3. 完整权限矩阵（按模块）
4. API 接口权限矩阵（按 controller × action × 角色）
5. 菜单 / 路由权限矩阵
6. 数据范围（dataScope）规则
7. 实施状态清单（✅ 已实现 / ❌ 缺失）
8. 本次新增 / 改动总结

### 7.2 后端 @Roles 注解补全

| Controller | 现状 | 计划加的注解 |
|---|---|---|
| `intake.controller.ts` | 只有 JwtAuthGuard | 全部加 `@Roles(...)`；列表/详情所有角色；`POST /`（create）→ 招商两类 + admin；`PATCH /:id` `POST /:id/submit` → 招商两类 + admin；`POST /:id/review` → 投资两类 + 中台 + admin；`POST /check` → 任何登录 |
| `follow-ups.controller.ts` | 只有 JwtAuthGuard | 创建 → 所有人；列表 → 所有人（按 dataScope）；删除 → 创建人 + admin |
| `visits.controller.ts` | 同上 | 同 follow-ups |
| `review.controller.ts` | 只有 JwtAuthGuard | list → 投资两类 + 中台 + admin；approve/reject → 投资负责人 + 中台 + admin |
| `reports.controller.ts` | 只有 JwtAuthGuard | 生成报告 → admin + 中台 + 投资负责人 |
| `dashboard.controller.ts` | 只有 JwtAuthGuard | 全部登录用户（按 dataScope） |
| `bi.controller.ts` | 只有 JwtAuthGuard | BI 数据 → admin + 中台 + 投资负责人 + 招商负责人 |
| `tianyancha.controller.ts` | 只有 JwtAuthGuard | 全部登录用户（查重） |
| `upload.controller.ts` | 只有 JwtAuthGuard | 全部登录用户 |

> 注意：之前已加的 `roles/users/regions/settings/referrals/rankings` controller 不动

### 7.3 后端 dataScope 过滤

**新增** `backend/src/common/utils/data-scope.util.ts`：
- 导出 `applyDataScope(qb, user, alias = 'i')` 函数
- 按 user.roles[0].dataScope 决定过滤条件
- 团队 scope 需要 team 表（先按 createdBy = user.id 简化实现，并打 TODO）

**接入点**：
- `intake.service.ts findAll` / `findOne`
- `follow-ups.service.ts findAll`
- `visits.service.ts findAll`
- `reviews.service.ts findAll`

### 7.4 前端路由 meta + 守卫

**修改** `frontend/src/router/index.ts`：
- 给每个路由加 `meta.roles?: string[]` 字段
- `router.beforeEach` 在 `requiresAuth` 通过后，判断 `meta.roles`：
  - 无值 → 放行
  - 有值 → 检查 `userStore.hasRole(...)`，不通过跳 403 或 dashboard

**修改** `frontend/src/App.vue`：
- 把侧边栏菜单（`menus` 数组）改为基于 `userStore.hasRole` 过滤后渲染

### 7.5 seed.ts 角色中文名同步

**修改** `backend/src/database/seed.ts`：
- `channel_specialist.name` → '招商专员'
- `channel_manager.name` → '招商负责人'

## 八、关键文件

| 文件 | 操作 |
|---|---|
| `docs/PERMISSIONS.md` | 新建 |
| `backend/src/modules/intakes/intake.controller.ts` | 改 |
| `backend/src/modules/follow-ups/follow-ups.controller.ts` | 改 |
| `backend/src/modules/visits/visits.controller.ts` | 改 |
| `backend/src/modules/reviews/reviews.controller.ts`（如存在） | 改 |
| `backend/src/modules/reports/reports.controller.ts` | 改 |
| `backend/src/modules/dashboard/dashboard.controller.ts` | 改 |
| `backend/src/modules/bi/bi.controller.ts` | 改 |
| `backend/src/modules/tianyancha/tianyancha.controller.ts` | 改 |
| `backend/src/modules/upload/upload.controller.ts` | 改 |
| `backend/src/common/utils/data-scope.util.ts` | 新建 |
| `backend/src/modules/intakes/intake.service.ts` | 改 findAll/findOne |
| `backend/src/modules/follow-ups/follow-ups.service.ts` | 改 findAll |
| `backend/src/modules/visits/visits.service.ts` | 改 findAll |
| `backend/src/database/seed.ts` | 改中文名 |
| `frontend/src/router/index.ts` | 改 meta + 守卫 |
| `frontend/src/App.vue` | 改菜单过滤 |

## 九、验收

1. **文档可读**：PERMISSIONS.md 包含 6 角色 × 全部权限点，方便用户一眼看完
2. **后端拦截**：
   - 用「招商专员」账号登录，调用 `POST /api/users` 应返回 403
   - 调用 `POST /api/intakes` 应能成功
   - 调用 `POST /api/intakes/:id/review` 应返回 403
3. **dataScope 生效**：
   - 招商专员 A 调 `GET /api/intakes`，看不到招商专员 B 的进件
   - 招商负责人 A 调，能看到自己 + 团队所有人的
4. **前端路由**：
   - 招商专员登录访问 `/pc/admin/roles`，应被重定向到 dashboard
   - 招商专员访问 `/pc/intakes/new`，应能进入
5. **前端菜单**：
   - 招商专员看不到「园区管理 / 用户管理 / 角色权限 / 中台审核 / 系统设置」菜单

## 十、风险 & 约束

- **现有数据范围**：用户表 `regionId` 字段可能为空，dataScope 需在 regionId 为空时按 `self` 处理
- **现有路由**：前端目前 13 个 PC 路由 + 8 个 mobile 路由，全要加 roles 字段，工作量略大
- **不破坏现有功能**：所有加 @Roles 注解后，原本 admin 账号的全权限必须保留
- **后续工作**：按钮级 v-permission 指令本次**不做**
