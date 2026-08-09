# 计划：进件查重先行 + 重复提交拦截 + 查重历史可查

## Summary

解决两个问题：

1. **基本信息的抓取有问题** — `applyToForm` 没有正确填充 `establishDateDayjs`、股东数据等（次要修复）
2. **"该企业已有在途跟进"提示太晚** — 当前 `doCheck` 直接调用 MCP（耗时 6-9 秒），提交进件时（step 4）才拦截；用户期望**第一步（step 1）就拦截重复进件，不调用 MCP**
3. **新需求（用户第二轮反馈）**：管理员和中台可以**查看"重复查询"历史记录**，作为风险排查依据

调整后流程：

```
用户输入企业名 → 点击"查询查重"
  ↓
1) 调 /api/intakes/check（查 DB 全部历史）
  ├─ 命中
  │   ├─ 写入 DuplicateCheckLog（intakeId/companyName/status/checkerId/checkerName/checkerPhone/createdAt/sourceIp）
  │   ├─ 前端 console.warn 同步记录
  │   ├─ 红色 alert: "该企业已提交过进件，请勿重复提交..."
  │   ├─ "查询查重" 按钮变灰
  │   ├─ "一键填充" 隐藏
  │   └─ 不调 MCP
  └─ 未命中
      └─ 调 /api/mcp/company/search 拿真实数据 → 继续原有核名流程

管理员/中台 → 侧边栏"系统设置"→ "查重历史" → 看到所有重复查询记录
```

---

## Current State Analysis

### 后端

- ✅ `POST /api/intakes/check` 已存在（[intake.controller.ts:81-88](file:///p:/产业投资进件系统/backend/src/modules/intakes/intake.controller.ts#L81-L88)）
- ⚠️ `checkExisting` 方法当前**只返回 boolean**（[intake.service.ts:93-105](file:///p:/产业投资进件系统/backend/src/modules/intakes/intake.service.ts#L93-L105)）
- ⚠️ 当前查重范围是 `['pending', 'approved', 'assigned', 'following']` 4 种状态（**不包括 rejected/landed/lost**）
- ❌ 没有 `DuplicateCheckLog` 实体
- ❌ 没有任何记录/展示重复查询历史的接口或页面

### 前端

- ❌ `IntakeForm.vue` 的 `doCheck` **完全没有调用 `/api/intakes/check`**（[IntakeForm.vue:632-659](file:///p:/产业投资进件系统/frontend/src/views/pc/intakes/IntakeForm.vue#L632-L659)），直接调 MCP
- ❌ step 1 模板里的 `<a-alert v-if="checkResult.exists">` **永远不会显示**（`mcpToLookupResult` 不返回 `exists`）
- ⚠️ `applyToForm` 的 `form.establishDate` 与 `form.establishDateDayjs` 不同步（a-date-picker 用的是后者）
- ⚠️ `applyToForm` 没有清空 `form.area` / `form.applicationRegionId`
- ❌ 系统设置菜单下没有"查重历史"页面

### 数据契约

| 字段 | 旧 API 返回 | 新 API 返回（向后兼容） |
|---|---|---|
| `exists` | `boolean` | `boolean`（不变） |
| `intakeId` | ❌ | `number \| undefined` |
| `status` | ❌ | `string \| undefined` |
| `createdAt` | ❌ | `string \| undefined` (ISO) |
| `applicantName` | ❌ | `string \| undefined` |
| `assignedToName` | ❌ | `string \| undefined` |

---

## Proposed Changes

### 1. 新建 `DuplicateCheckLog` 实体（持久化查重历史）

**新文件**：[backend/src/entities/duplicate-check-log.entity.ts](file:///p:/产业投资进件系统/backend/src/entities/duplicate-check-log.entity.ts)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('duplicate_check_logs')
@Index(['companyName'])
@Index(['createdAt'])
export class DuplicateCheckLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string;

  @Column()
  intakeId: number;                                  // 命中的已有进件

  @Column()
  intakeCompanyName: string;                         // 命中的进件当时填的名称（防止重命名后查不到）

  @Column()
  intakeStatus: string;                              // 命中进件的状态

  @CreateDateColumn()
  intakeCreatedAt: Date;                             // 命中进件的创建时间

  @Column()
  checkerId: number;

  @Column()
  checkerName: string;

  @Column()
  checkerPhone: string;

  @Column({ nullable: true })
  sourceIp: string;

  @CreateDateColumn()
  createdAt: Date;                                   // 查重动作发生的时间

  // 关联（eager join, 方便列表展示）
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'checkerId' })
  checker: User;
}
```

**字段说明**：
- `intakeCompanyName` / `intakeStatus` / `intakeCreatedAt` 冗余存储"当时命中的进件快照"，避免后续进件改名/状态变化导致历史失真
- `sourceIp` 方便安全审计
- 双外键：`intakeId: number`（裸列，便于快速过滤）+ 不做 Intake 关联（避免循环依赖，且只需要 ID）

### 2. 注册新实体

**修改**：[backend/src/app.module.ts](file:///p:/产业投资进件系统/backend/src/app.module.ts) 第 52 行的 `entities: [...]` 数组

```typescript
entities: [User, Role, Permission, Region, Intake, IntakeFile, Review, Report, FollowUp, Visit, Setting, Referral, DuplicateCheckLog],
```

由于 `synchronize: true`（better-sqlite3），重启即自动建表。

### 3. 后端 service 扩展 `checkExisting` 返回详情

**修改**：[backend/src/modules/intakes/intake.service.ts](file:///p:/产业投资进件系统/backend/src/modules/intakes/intake.service.ts)

```typescript
async checkExisting(companyName: string, excludeId?: number) {
  const qb = this.intakeRepo.createQueryBuilder('i');
  qb.leftJoinAndSelect('i.assignedTo', 'assignedTo');
  qb.leftJoinAndSelect('i.applicant', 'applicant');
  qb.where('i.companyName = :companyName', { companyName });
  if (excludeId) qb.andWhere('i.id != :excludeId', { excludeId });
  qb.orderBy('i.createdAt', 'DESC');
  const existing = await qb.getOne();
  if (!existing) return { exists: false } as const;
  return {
    exists: true,
    intakeId: existing.id,
    companyName: existing.companyName,
    status: existing.status,
    createdAt: existing.createdAt,
    applicantName: existing.applicant?.name,
    applicantPhone: existing.applicant?.phone,
    assignedToName: existing.assignedTo?.name,
    assignedToPhone: existing.assignedTo?.phone,
  } as const;
}
```

- 去掉 `status IN (...)` 过滤，命中所有历史
- eager join `applicant` 和 `assignedTo`（已 eager，但 leftJoin 显式确保返回）
- 按 `createdAt DESC` 取最近一条

### 4. 后端 controller 在 `check` 端点增加命中日志记录

**修改**：[backend/src/modules/intakes/intake.controller.ts](file:///p:/产业投资进件系统/backend/src/modules/intakes/intake.controller.ts)

```typescript
@Post('check')
@Roles(...ALL_ROLES)
async check(
  @Body() dto: CheckIntakeDto,
  @Req() req: { user: any },
) {
  const result = await this.intakeService.checkExisting(dto.companyName);
  if (result.exists) {
    // 1) NestJS Logger（开发日志）
    const u = req.user;
    this.logger.warn(
      `[查重命中] "${dto.companyName}" 命中进件 #${result.intakeId} (${result.status}, ${result.createdAt?.toISOString()}) — 查询人: ${u?.name} (id=${u?.id}) at ${new Date().toISOString()}`,
    );

    // 2) 持久化到 DuplicateCheckLog
    await this.dupLogRepo.save({
      companyName: dto.companyName,
      intakeId: result.intakeId!,
      intakeCompanyName: result.companyName!,
      intakeStatus: result.status!,
      intakeCreatedAt: result.createdAt!,
      checkerId: u.id,
      checkerName: u.name,
      checkerPhone: u.phone,
      sourceIp: req.ip,
    });
  }
  return result;
}
```

需要在 controller 注入 `DuplicateCheckLog` 的 Repository：

```typescript
constructor(
  private readonly intakeService: IntakeService,
  @InjectRepository(DuplicateCheckLog) private readonly dupLogRepo: Repository<DuplicateCheckLog>,
) {}
```

并在 [intake.module.ts](file:///p:/产业投资进件系统/backend/src/modules/intakes/intake.module.ts) 的 `TypeOrmModule.forFeature([...])` 数组中加 `DuplicateCheckLog`。

### 5. 新建"查重历史"模块（CRUD 接口）

**新文件**：
- [backend/src/modules/duplicate-check-logs/duplicate-check-logs.module.ts](file:///p:/产业投资进件系统/backend/src/modules/duplicate-check-logs/duplicate-check-logs.module.ts)
- [backend/src/modules/duplicate-check-logs/duplicate-check-logs.service.ts](file:///p:/产业投资进件系统/backend/src/modules/duplicate-check-logs/duplicate-check-logs.service.ts)
- [backend/src/modules/duplicate-check-logs/duplicate-check-logs.controller.ts](file:///p:/产业投资进件系统/backend/src/modules/duplicate-check-logs/duplicate-check-logs.controller.ts)

**Controller 接口**：

```typescript
@Controller('api/duplicate-check-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DuplicateCheckLogsController {
  constructor(private readonly svc: DuplicateCheckLogsService) {}

  // 分页查询 + 关键字/状态/时间过滤
  @Post('query')
  @Roles('admin', 'middleware_ops')
  query(@Body() params: QueryLogDto) {
    return this.svc.query(params);
  }

  // 详情
  @Get(':id')
  @Roles('admin', 'middleware_ops')
  get(@Param('id') id: string) {
    return this.svc.findOne(Number(id));
  }

  // 统计：最近 30 天命中次数 / Top 重复企业 / Top 查询人
  @Get('stats/summary')
  @Roles('admin', 'middleware_ops')
  stats() {
    return this.svc.summary();
  }
}
```

**Service 方法**：
- `query({ companyName?, checkerPhone?, intakeStatus?, startDate?, endDate?, page, pageSize })` — 分页
- `findOne(id)` — 详情
- `summary()` — 用 `createQueryBuilder` 聚合，返回 `{ last30DaysCount, topDuplicatedCompanies: [{companyName, count}], topCheckers: [{checkerName, count}] }`

**QueryLogDto**（新文件）：

```typescript
export class QueryLogDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() checkerPhone?: string;
  @IsOptional() @IsString() intakeStatus?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() pageSize?: number;
}
```

**在 app.module.ts 中注册**：

```typescript
imports: [..., DuplicateCheckLogsModule]
```

### 6. 前端 API 模块

**新文件**：[frontend/src/api/modules/duplicate-check-logs.ts](file:///p:/产业投资进件系统/frontend/src/api/modules/duplicate-check-logs.ts)

```typescript
export interface DuplicateCheckLog {
  id: number;
  companyName: string;
  intakeId: number;
  intakeCompanyName: string;
  intakeStatus: string;
  intakeCreatedAt: string;
  checkerId: number;
  checkerName: string;
  checkerPhone: string;
  sourceIp?: string;
  createdAt: string;
}

export interface QueryLogParams {
  companyName?: string;
  checkerPhone?: string;
  intakeStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export function queryDuplicateCheckLogs(params: QueryLogParams) {
  return request<{ items: DuplicateCheckLog[]; total: number }>({
    url: '/api/duplicate-check-logs/query',
    method: 'post',
    data: params,
  });
}

export function getDuplicateCheckLogSummary() {
  return request<{
    last30DaysCount: number;
    topDuplicatedCompanies: Array<{ companyName: string; count: number }>;
    topCheckers: Array<{ checkerName: string; count: number }>;
  }>({
    url: '/api/duplicate-check-logs/stats/summary',
    method: 'get',
  });
}
```

### 7. 前端"查重历史"页面

**新文件**：[frontend/src/views/pc/admin/DuplicateCheckLogs.vue](file:///p:/产业投资进件系统/frontend/src/views/pc/admin/DuplicateCheckLogs.vue)

参考 [Settings.vue](file:///p:/产业投资进件系统/frontend/src/views/pc/admin/Settings.vue) 的卡片样式（PC 端 admin 风格），包含：

- **顶部统计卡片**（3 张）：
  - "近 30 天查重命中" 数字
  - "Top 5 重复企业" 列表（去重后命中次数）
  - "Top 5 查询人" 列表（按 phone 分组）

- **过滤栏**：
  - 企业名称输入框
  - 查询人手机号输入框
  - 命中进件状态下拉框（pending/approved/assigned/following/landed/lost/rejected）
  - 时间范围 picker
  - "查询" / "重置" 按钮

- **数据表格**（`a-table`）：
  - 列：查重时间 / 命中企业名 / 命中进件 ID / 命中进件状态 / 命中进件创建时间 / 查询人 / 查询人手机 / IP
  - 默认按"查重时间 DESC"排序
  - 分页

- **行点击**：跳转到 `pc/intakes/{intakeId}` 详情页（`router.push`）

### 8. 前端路由注册

**修改**：[frontend/src/router/index.ts](file:///p:/产业投资进件系统/frontend/src/router/index.ts)

在 `/pc` children 数组中，`admin/settings` 路由后追加：

```typescript
{
  path: 'admin/duplicate-check-logs',
  name: 'PCAdminDuplicateCheckLogs',
  component: () => import('@/views/pc/admin/DuplicateCheckLogs.vue'),
  meta: {
    title: '查重历史',
    platform: 'pc',
    requiresAuth: true,
    roles: [R_ADMIN, R_MIDDLEWARE],
    icon: 'WarningOutlined',  // 可选
  },
},
```

（R_ADMIN / R_MIDDLEWARE 已经在文件顶部定义）

### 9. 前端"系统设置"侧边栏加子菜单

**修改**：[frontend/src/components/pc/PCSidebar.vue](file:///p:/产业投资进件系统/frontend/src/components/pc/PCSidebar.vue) 或对应的侧边栏组件

如果有"系统设置"折叠组（`a-sub-menu`），在其 children 中追加"查重历史"菜单项。如果没有，就在"系统设置"项下增加子菜单。**（需根据实际 sidebar 结构调整，先在 plan 中标记，实施时确认）**

### 10. 前端 `doCheck` 改造：查重先行

**修改**：[frontend/src/views/pc/intakes/IntakeForm.vue](file:///p:/产业投资进件系统/frontend/src/views/pc/intakes/IntakeForm.vue)

```typescript
import { checkIntakeExists } from '@/api/modules/intakes';

async function doCheck() {
  if (!form.companyName.trim()) {
    message.warning('请输入企业名称');
    return;
  }
  checking.value = true;
  checkResult.value = null;
  lookupResult.value = null;
  duplicateCheckInfo.value = null;

  try {
    const name = form.companyName.trim();

    // 1) 先查重
    const dup = await checkIntakeExists(name);
    if (dup.exists) {
      // 前端 console 同步记录
      const u = (window as any).__currentUser;
      console.warn(
        `[查重命中] "${name}" 已有进件 #${dup.intakeId} (${dup.status}) - ` +
        `查询人: ${u?.name} (id=${u?.id}) at ${new Date().toISOString()}`,
      );
      duplicateCheckInfo.value = dup;
      checkResult.value = { exists: true };
      message.error('该企业已提交过进件，请勿重复提交。如需重新发起请联系中台运营。');
      return; // 不调 MCP
    }

    // 2) 未命中 → 调 MCP
    const mcp = await searchMcpCompany(name);
    const result: any = mcpToLookupResult(mcp);
    lookupResult.value = result;
    checkResult.value = { exists: false };

    if (!result.isValid) {
      message.warning('企业核名未通过，请查看未通过项');
    } else {
      message.success(`核名通过，综合评分 ${result.rating ?? 0} 分`);
    }
  } catch (e: any) {
    message.error(e.message || '查询失败');
  } finally {
    checking.value = false;
  }
}
```

新增 ref：
```typescript
const duplicateCheckInfo = ref<IntakeCheckResult | null>(null);
```

### 11. 前端模板：查重提示 + 锁定交互

**修改**：[frontend/src/views/pc/intakes/IntakeForm.vue](file:///p:/产业投资进件系统/frontend/src/views/pc/intakes/IntakeForm.vue) 模板

**A. 替换原 `<a-alert v-if="checkResult && checkResult.exists">`**

```vue
<a-alert
  v-if="checkResult && checkResult.exists"
  type="error"
  show-icon
  message="该企业已提交过进件，请勿重复提交。"
  description="如需重新发起请联系中台运营。"
  style="margin-bottom: 16px"
/>
```

**B. "查询查重" 按钮增加 disabled 条件**

```vue
<a-button
  type="primary"
  size="large"
  :loading="checking"
  :disabled="!form.companyName.trim() || (checkResult?.exists === true)"
  @click="doCheck"
  block
>
```

**C. 监听 `form.companyName` 变化时清空状态**

```typescript
watch(
  () => form.companyName,
  () => {
    checkResult.value = null;
    duplicateCheckInfo.value = null;
  },
);
```

让用户修改企业名后可以重新查重。

### 12. `applyToForm` 顺手修复

- 同时设置 `form.establishDate` 和 `form.establishDateDayjs`（已修）
- 保持 `shareholders` 已修
- 不修改 `area` / `applicationRegionId`（用户手动填）

---

## Assumptions & Decisions

| 决策 | 选择 | 原因 |
|---|---|---|
| 查重范围 | **全部历史**（无 status 过滤） | 用户明确要求"包含已驳回" |
| 提示文案 | "该企业已提交过进件，请勿重复提交。如需重新发起请联系中台运营。" | 用户指定 |
| API 返回结构 | **向后兼容**：`exists` 保留，扩展其他字段 | 不破坏现有调用 |
| 查重 vs MCP 顺序 | **查重先** | 用户要求避免重复调 MCP |
| 记录位置 | **持久化到 DB（DuplicateCheckLog 表）+ 前端 console + 后端 logger** | 用户第二轮要求"管理员/中台可查" |
| 查重历史可见角色 | **admin + middleware_ops** | 用户指定 |
| 交互状态 | 查重命中后：禁用"查询"按钮 + 隐藏"一键填充" + 阻止进入 step 2 | 用户要求"不能进行下一步" |
| 是否记入 `intake.assignedTo` 关联 | **是**（leftJoinAndSelect） | 方便后续扩展 |
| 重复查询是否计入审计 | **是** | 用户要求"排查风险" |
| 时间范围过滤默认值 | 最近 30 天 | 适合运营场景 |

---

## Verification steps

1. **后端编译**
   ```bash
   cd backend && npm run start:dev
   # 期待: Found 0 errors
   # 期待: TypeORM 自动创建 duplicate_check_logs 表
   ```

2. **API 验证**（curl）
   ```bash
   # 用已有的进件测试
   curl -X POST http://localhost:3000/api/intakes/check \
     -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -d '{"companyName":"广东朗为供应链科技有限公司"}'
   # 期待: { exists: true, intakeId: 50, status, createdAt, applicantName, ... }
   ```

3. **查重日志持久化验证**
   ```bash
   # 查重后
   curl -X POST http://localhost:3000/api/duplicate-check-logs/query \
     -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
     -d '{"page":1,"pageSize":10}'
   # 期待: 看到刚才的查重记录
   ```

4. **dev.log 验证**
   ```
   [Nest] WARN [IntakeController] [查重命中] "广东朗为..." 命中进件 #50 ...
   ```

5. **前端浏览器验证**
   - 打开 `http://localhost:5175/pc/intakes/new`
   - 输入已存在的企业名 → 点击"查询查重"
   - **期待**：
     - 红色 alert 立即显示
     - 浏览器 console 出现 `[查重命中]`
     - 后端 dev.log 出现 `[查重命中]`
     - "查询查重"按钮变灰
     - "一键填充"隐藏
     - **MCP 没被调用**（dev.log 无 `[MCP] search`）
   - 修改企业名 → 重查 → MCP 正常返回

6. **查重历史页面验证**
   - 用 admin/middleware_ops 登录
   - 侧边栏"系统设置" → "查重历史"
   - **期待**：
     - 看到刚才触发的查重记录
     - 顶部统计卡片显示正确的命中次数
     - 过滤栏可按企业名/手机/状态/时间筛选
     - 点击行跳转到对应进件详情

---

## Out of scope

- 修改 `intake.service.ts` 的 `create` 校验逻辑（用户没要求；现有的"已有在途跟进"提示保留）
- 重复进件的"查看已有进件"按钮（管理员通过查重历史页面跳转到详情）
- 移动端兼容（PC 端表单）
- 重复查询时的"告警邮件"通知（用户没要求）

---

## Files Changed

| 文件 | 变更 |
|---|---|
| `backend/src/entities/duplicate-check-log.entity.ts` | **新建**：实体定义 |
| `backend/src/app.module.ts` | 追加 `DuplicateCheckLog` 到 entities 数组；注册 `DuplicateCheckLogsModule` |
| `backend/src/modules/intakes/intake.service.ts` | `checkExisting` 返回对象（去掉 status 过滤） |
| `backend/src/modules/intakes/intake.controller.ts` | `check` 端点加 `@Req()` + 写入 DuplicateCheckLog |
| `backend/src/modules/intakes/intake.module.ts` | `TypeOrmModule.forFeature([..., DuplicateCheckLog])` |
| `backend/src/modules/duplicate-check-logs/duplicate-check-logs.module.ts` | **新建** |
| `backend/src/modules/duplicate-check-logs/duplicate-check-logs.service.ts` | **新建**：query / findOne / summary |
| `backend/src/modules/duplicate-check-logs/duplicate-check-logs.controller.ts` | **新建**：3 个端点 |
| `backend/src/modules/duplicate-check-logs/dto/query-log.dto.ts` | **新建** |
| `frontend/src/api/modules/intakes.ts` | 新增 `IntakeCheckResult` 类型 |
| `frontend/src/api/modules/duplicate-check-logs.ts` | **新建** |
| `frontend/src/views/pc/admin/DuplicateCheckLogs.vue` | **新建** |
| `frontend/src/router/index.ts` | 追加路由 |
| `frontend/src/views/pc/intakes/IntakeForm.vue` | `doCheck` 改造 + 模板 alert 文案 + 按钮 disabled + watch 清空 |

约 14 个文件（10 新建 / 4 修改），无 schema 迁移脚本（synchronize: true 自动建表），无新依赖。
