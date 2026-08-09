# 产业投资进件系统 — 角色权限手册

> 版本：v1.0 · 更新日期：2026-08-08
> 适用对象：产品 / 研发 / 测试 / 运营

---

## 一、概述

本系统采用 **RBAC（基于角色的访问控制）+ 数据范围（dataScope）** 模型：

- **权限（Permission）**：原子操作（如 `intake:create`），定义在权限表
- **角色（Role）**：一组权限的集合，并附带 **数据范围** 字段
- **用户（User）**：可以拥有 1-N 个角色，权限与数据范围取并集
- **菜单 / 路由 / API / 数据**：四层均受权限控制

## 二、角色清单（共 6 个）

| # | code | 中文名 | 旧中文 | dataScope | 主要职责 |
|---|---|---|---|---|---|
| 1 | `admin` | 超级管理员 | 系统管理员 | all | 系统全部权限 |
| 2 | `middleware_ops` | 中台运营 | 中台运营 | region | 系统运营 / 评审 / BI / 园区 / 设置 |
| 3 | `investment_manager` | 投资负责人 | 投资经理 | region | 投资决策 / 项目 / 评审审批 |
| 4 | `investment_staff` | 投资专员 | 投资专员 | self | 项目尽调 / 创建评审 |
| 5 | `channel_manager` | 招商负责人 | 渠道主管 | team | 团队进件管理 / 跟进 / 拜访 |
| 6 | `channel_specialist` | 招商专员 | 渠道专员 | self | 录入进件 / 跟进 / 拜访 / 推荐 |

> ⚠️ 本次升级将 `channel_specialist` 中文名由「渠道专员」改为「招商专员」，`channel_manager` 由「渠道主管」改为「招商负责人」。`code` 保持不变以兼容历史数据。

## 三、权限矩阵

> ✅ = 有权限 / 允许 ； – = 无权限 / 禁止
> 括号中"（仅 self）"等表示 dataScope 限定

### 3.1 权限点（permissions）

| 权限 code | 名称 | admin | 中台 | 投资负责人 | 投资专员 | 招商负责人 | 招商专员 |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `intake:view` | 查看进件 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅（仅 self） |
| `intake:create` | 创建进件 | ✅ | – | – | – | ✅ | ✅ |
| `intake:edit` | 编辑进件 | ✅ | – | – | – | ✅（团队） | ✅（仅 self） |
| `intake:delete` | 删除进件 | ✅ | – | – | – | ✅（团队） | – |
| `intake:submit` | 提交进件 | ✅ | – | – | – | ✅ | ✅ |
| `review:view` | 查看评审 | ✅ | ✅ | ✅ | ✅ | – | – |
| `review:create` | 创建评审 | ✅ | ✅ | ✅ | ✅ | – | – |
| `review:approve` | 审批通过 | ✅ | ✅ | ✅ | – | – | – |
| `review:reject` | 驳回评审 | ✅ | ✅ | ✅ | – | – | – |
| `project:view` | 查看项目 | ✅ | ✅ | ✅ | ✅ | – | – |
| `project:create` | 创建项目 | ✅ | – | ✅ | ✅ | – | – |
| `project:edit` | 编辑项目 | ✅ | – | ✅ | ✅ | – | – |
| `project:delete` | 删除项目 | ✅ | – | ✅ | – | – | – |
| `bi:view` | 查看报表 | ✅ | ✅ | ✅ | – | ✅ | – |
| `bi:export` | 导出报表 | ✅ | ✅ | ✅ | – | – | – |
| `user:view` | 查看用户 | ✅ | ✅ | – | – | – | – |
| `user:create` | 创建用户 | ✅ | – | – | – | – | – |
| `user:edit` | 编辑用户 | ✅ | – | – | – | – | – |
| `user:delete` | 删除用户 | ✅ | – | – | – | – | – |
| `role:view` | 查看角色 | ✅ | – | – | – | – | – |
| `role:create` | 创建角色 | ✅ | – | – | – | – | – |
| `role:edit` | 编辑角色 | ✅ | – | – | – | – | – |
| `role:delete` | 删除角色 | ✅ | – | – | – | – | – |
| `setting:view` | 查看配置 | ✅ | ✅ | – | – | – | – |
| `setting:edit` | 编辑配置 | ✅ | ✅ | – | – | – | – |

### 3.2 数据范围（dataScope）

| 角色 | scope | SQL 过滤规则 | 备注 |
|---|---|---|---|
| `admin` | `all` | 不加过滤 | 看全部 |
| `middleware_ops` | `region` | `region_id = :userRegionId` | 按所在区域 |
| `investment_manager` | `region` | `region_id = :userRegionId` | 按所在区域 |
| `investment_staff` | `self` | `created_by = :userId` | 仅看自己创建的 |
| `channel_manager` | `team` | `created_by IN (:teamIds)` | 团队所有 |
| `channel_specialist` | `self` | `created_by = :userId` | 仅看自己创建的 |

> **注意**：若 `user.regionId` 为空，region 类型自动降级为 `self`（仅看自己），保证不会越权。

## 四、API 接口权限矩阵

> 详细到 controller × action
> 标记 `[已实现]` 表示本次升级后由后端 `@Roles` 守卫拦截；`[dataScope]` 表示同时受数据范围约束

### 4.1 进件（intakes）

| Method | Path | 允许角色 | dataScope | 状态 |
|---|---|---|---|---|
| GET | `/api/intakes` | 全部 6 角色 | 列表按 dataScope 过滤 | [已实现] |
| GET | `/api/intakes/:id` | 全部 6 角色 | 仅可见自己的 | [已实现] |
| POST | `/api/intakes` | admin / channel_manager / channel_specialist | – | [已实现] |
| POST | `/api/intakes/check` | 全部 6 角色（查重） | – | [已实现] |
| PATCH | `/api/intakes/:id` | admin / channel_manager（团队）/ channel_specialist（仅自己） | [dataScope] | [已实现] |
| POST | `/api/intakes/:id/submit` | admin / channel_manager / channel_specialist | [dataScope] | [已实现] |
| POST | `/api/intakes/:id/review` | admin / middleware_ops / investment_manager | – | [已实现] |
| GET | `/api/intakes/:id/history` | 全部 6 角色 | – | [已实现] |

### 4.2 跟进记录（follow-ups）

| Method | Path | 允许角色 | dataScope | 状态 |
|---|---|---|---|---|
| GET | `/api/follow-ups` | 全部 6 角色 | [dataScope] | [已实现] |
| GET | `/api/follow-ups/my` | 全部 6 角色 | self | [已实现] |
| POST | `/api/follow-ups` | 全部 6 角色 | – | [已实现] |
| PATCH | `/api/follow-ups/:id` | 创建人 / admin | self | [已实现] |
| DELETE | `/api/follow-ups/:id` | 创建人 / admin | self | [已实现] |

### 4.3 拜访记录（visits）

| Method | Path | 允许角色 | dataScope | 状态 |
|---|---|---|---|---|
| GET | `/api/visits` | 全部 6 角色 | [dataScope] | [已实现] |
| GET | `/api/visits/my` | 全部 6 角色 | self | [已实现] |
| POST | `/api/visits` | 全部 6 角色 | – | [已实现] |
| PATCH | `/api/visits/:id` | 创建人 / admin | self | [已实现] |
| DELETE | `/api/visits/:id` | 创建人 / admin | self | [已实现] |

### 4.4 评审（review）

> review controller 共用 `intake.controller.ts` 的 `:id/review` 入口

| Method | Path | 允许角色 | 状态 |
|---|---|---|---|
| GET | `/api/review` | admin / middleware_ops / investment_manager / investment_staff | [已实现] |
| GET | `/api/review/:id` | 同上 | [已实现] |
| POST | `/api/review/:id/approve` | admin / middleware_ops / investment_manager | [已实现] |
| POST | `/api/review/:id/reject` | admin / middleware_ops / investment_manager | [已实现] |

### 4.5 数据大屏（bi）

| Method | Path | 允许角色 | 状态 |
|---|---|---|---|
| GET | `/api/bi/*` | admin / middleware_ops / investment_manager / channel_manager | [已实现] |

### 4.6 报表（reports）

| Method | Path | 允许角色 | 状态 |
|---|---|---|---|
| GET | `/api/reports/*` | admin / middleware_ops / investment_manager | [已实现] |
| POST | `/api/reports/generate` | admin / middleware_ops / investment_manager | [已实现] |

### 4.7 工作台（dashboard）

| Method | Path | 允许角色 | 状态 |
|---|---|---|---|
| GET | `/api/dashboard/stats` | 全部 6 角色（按 dataScope） | [已实现] |
| GET | `/api/dashboard/team` | admin / middleware_ops / investment_manager / channel_manager | [已实现] |

### 4.8 天眼查（tianyancha）

| Method | Path | 允许角色 | 状态 |
|---|---|---|---|
| POST | `/api/tyc/search` | 全部 6 角色 | [已实现] |
| POST | `/api/tyc/validate` | 全部 6 角色 | [已实现] |
| POST | `/api/tyc/lookup` | 全部 6 角色 | [已实现] |

### 4.9 上传（upload）

| Method | Path | 允许角色 | 状态 |
|---|---|---|---|
| POST | `/api/upload/file` | 全部 6 角色 | [已实现] |

### 4.10 已有权限的模块（本次不变）

| 模块 | 角色 | 状态 |
|---|---|---|
| users | 仅 admin（部分含 middleware_ops / investment_manager） | [已实现] |
| roles | 仅 admin | [已实现] |
| regions | admin / middleware_ops | [已实现] |
| settings | admin / middleware_ops | [已实现] |
| referrals | 全部 + admin 用于删除 | [已实现] |
| rankings | 全部 | [已实现] |

## 五、菜单 / 路由权限矩阵（前端）

| 菜单 | 路由 | admin | 中台 | 投资负责人 | 投资专员 | 招商负责人 | 招商专员 |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
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

### 移动端（mobile）

| 菜单 | 路由 | admin | 中台 | 投资负责人 | 投资专员 | 招商负责人 | 招商专员 |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| 首页 | `/mobile/home` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 进件管理 | `/mobile/intakes` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 新建进件 | `/mobile/intakes/new` | ✅ | – | – | – | ✅ | ✅ |
| 记录跟进 | `/mobile/follow-ups/new` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 记录拜访 | `/mobile/visits/new` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 数据概览 | `/mobile/bi` | ✅ | ✅ | ✅ | – | ✅ | – |
| 我的推荐 | `/mobile/referrals` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 六、实施状态清单

### 6.1 后端

| # | 内容 | 文件 | 状态 |
|---|---|---|---|
| 1 | RolesGuard 实现 | `common/guards/roles.guard.ts` | ✅ 已有 |
| 2 | Roles / Permissions 装饰器 | `common/decorators/roles.decorator.ts` | ✅ 已有 |
| 3 | JwtStrategy 加载 roles.permissions | `modules/auth/jwt.strategy.ts` | ✅ 已有 |
| 4 | 6 角色 + 25 权限 seed | `database/seed.ts` | ✅ 已升级中文名 |
| 5 | roles / users / regions / settings controller 加 RolesGuard | 各自 controller | ✅ 已有 |
| 6 | intake controller 加 @Roles | `modules/intakes/intake.controller.ts` | ✅ **本次新增** |
| 7 | follow-ups controller 加 @Roles | `modules/follow-ups/follow-ups.controller.ts` | ✅ **本次新增** |
| 8 | visits controller 加 @Roles | `modules/visits/visits.controller.ts` | ✅ **本次新增** |
| 9 | reports controller 加 @Roles | `modules/reports/reports.controller.ts` | ✅ **本次新增** |
| 10 | dashboard controller 加 @Roles | `modules/dashboard/dashboard.controller.ts` | ✅ **本次新增** |
| 11 | bi controller 加 @Roles | `modules/bi/bi.controller.ts` | ✅ **本次新增** |
| 12 | tianyancha controller 加 @Roles | `modules/tianyancha/tianyancha.controller.ts` | ✅ **本次新增** |
| 13 | upload controller 加 @Roles | `modules/upload/upload.controller.ts` | ✅ **本次新增** |
| 14 | dataScope 工具 | `common/utils/data-scope.util.ts` | ✅ **本次新增** |
| 15 | intake.findAll / findOne 加 dataScope | `modules/intakes/intake.service.ts` | ✅ **本次新增** |
| 16 | follow-ups.findAll 加 dataScope | `modules/follow-ups/follow-ups.service.ts` | ✅ **本次新增** |
| 17 | visits.findAll 加 dataScope | `modules/visits/visits.service.ts` | ✅ **本次新增** |

### 6.2 前端

| # | 内容 | 文件 | 状态 |
|---|---|---|---|
| 1 | useUserStore 提供 hasRole / hasPermission | `stores/user.ts` | ✅ 已有 |
| 2 | 登录返回 roles[] / permissions[] | `api/auth.ts` | ✅ 已有 |
| 3 | route meta 增加 roles 字段 | `router/index.ts` | ✅ **本次新增** |
| 4 | router.beforeEach 检查 meta.roles | `router/index.ts` | ✅ **本次新增** |
| 5 | App.vue 侧边栏按角色过滤 | `App.vue` | ✅ **本次新增** |
| 6 | 移动端菜单按角色过滤 | `App.vue` / 移动 layout | ✅ **本次新增** |
| 7 | 按钮级 v-permission 指令 | – | ⏳ **后续** |

## 七、本次改动总结

### 新增文件

- `docs/PERMISSIONS.md`（本文档）
- `backend/src/common/utils/data-scope.util.ts`

### 修改文件（后端）

- `src/database/seed.ts`：渠道专员 / 渠道主管 → 招商专员 / 招商负责人
- `src/modules/intakes/intake.controller.ts`：加 @Roles
- `src/modules/follow-ups/follow-ups.controller.ts`：加 @Roles
- `src/modules/visits/visits.controller.ts`：加 @Roles
- `src/modules/reports/reports.controller.ts`：加 @Roles
- `src/modules/dashboard/dashboard.controller.ts`：加 @Roles
- `src/modules/bi/bi.controller.ts`：加 @Roles
- `src/modules/tianyancha/tianyancha.controller.ts`：加 @Roles
- `src/modules/upload/upload.controller.ts`：加 @Roles
- `src/modules/intakes/intake.service.ts`：findAll / findOne 加 dataScope
- `src/modules/follow-ups/follow-ups.service.ts`：findAll 加 dataScope
- `src/modules/visits/visits.service.ts`：findAll 加 dataScope

### 修改文件（前端）

- `src/router/index.ts`：13 个 PC 路由 + 8 个 mobile 路由加 `meta.roles`；`router.beforeEach` 检查
- `src/App.vue`：菜单按 `userStore.hasRole` 过滤

## 八、验收测试用例

### 用例 1：招商专员（channel_specialist）

| 序号 | 操作 | 期望 |
|---|---|---|
| 1.1 | 登录 | 成功，看到"工作台 / 进件管理 / 跟进记录 / 拜访记录 / 我的推荐"菜单 |
| 1.2 | 访问 `/pc/admin/roles` | 重定向到 `/pc/dashboard` |
| 1.3 | 调用 `POST /api/users` | 返回 403 Forbidden |
| 1.4 | 调用 `POST /api/intakes` | 200 OK |
| 1.5 | 调用 `POST /api/intakes/:id/review` | 403 |
| 1.6 | 调用 `GET /api/intakes` | 只能看到自己创建的进件 |

### 用例 2：招商负责人（channel_manager）

| 序号 | 操作 | 期望 |
|---|---|---|
| 2.1 | 登录 | 成功，多看到「团队工作台」「数据大屏」菜单 |
| 2.2 | 调用 `GET /api/intakes` | 看到自己 + 团队所有人的进件 |
| 2.3 | 调用 `PATCH /api/intakes/:id` | 团队内任何人的都能编辑 |

### 用例 3：中台运营（middleware_ops）

| 序号 | 操作 | 期望 |
|---|---|---|
| 3.1 | 登录 | 看到「中台审核 / 园区管理 / 用户管理 / 系统设置 / 数据大屏」 |
| 3.2 | 调用 `POST /api/intakes` | 403（中台不能录进件） |
| 3.3 | 调用 `POST /api/intakes/:id/review` | 200 |
| 3.4 | 调用 `POST /api/roles` | 403 |

### 用例 4：投资负责人（investment_manager）

| 序号 | 操作 | 期望 |
|---|---|---|
| 4.1 | 登录 | 看到「中台审核 / 数据大屏」，看不到「新建进件」 |
| 4.2 | 调用 `POST /api/intakes` | 403 |
| 4.3 | 调用 `POST /api/intakes/:id/review` | 200 |

### 用例 5：超级管理员（admin）

| 序号 | 操作 | 期望 |
|---|---|---|
| 5.1 | 任何 API | 200 / 正常返回 |
| 5.2 | 任何菜单 | 都能看到 |

## 九、后续工作（未实施）

- ⏳ **按钮级权限指令** `v-permission` / `v-role`：组件级别控制按钮显隐
- ⏳ **数据权限细化**：团队 scope 引入真实团队表（当前简化为 self）
- ⏳ **审计日志**：谁在什么时间操作了什么
- ⏳ **字段级权限**：例如隐藏"实际投资金额"对招商可见
- ⏳ **权限继承**：支持父子权限（如 `intake:*` 包含 `intake:view/create/edit`）

---

> 📌 **维护说明**：本文档与代码同源。如修改权限矩阵，请同步更新：
> 1. `backend/src/database/seed.ts` 的 `PERMISSIONS_DATA` 数组
> 2. 对应 controller 的 `@Roles(...)` 装饰器
> 3. 前端 `router/index.ts` 的 `meta.roles`
> 4. 重新 seed 一次：`cd backend && npx ts-node src/database/seed.ts`
