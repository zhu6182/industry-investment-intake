"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../entities/user.entity");
const role_entity_1 = require("../entities/role.entity");
const permission_entity_1 = require("../entities/permission.entity");
const region_entity_1 = require("../entities/region.entity");
const intake_entity_1 = require("../entities/intake.entity");
const intake_file_entity_1 = require("../entities/intake-file.entity");
const review_entity_1 = require("../entities/review.entity");
const report_entity_1 = require("../entities/report.entity");
const follow_up_entity_1 = require("../entities/follow-up.entity");
const visit_entity_1 = require("../entities/visit.entity");
const setting_entity_1 = require("../entities/setting.entity");
const referral_entity_1 = require("../entities/referral.entity");
const dataSource = new typeorm_1.DataSource({
    type: 'better-sqlite3',
    database: './data.db',
    entities: [user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, region_entity_1.Region, intake_entity_1.Intake, intake_file_entity_1.IntakeFile, review_entity_1.Review, report_entity_1.Report, follow_up_entity_1.FollowUp, visit_entity_1.Visit, setting_entity_1.Setting, referral_entity_1.Referral],
});
const ROLES_DATA = [
    { code: 'channel_specialist', name: '招商专员', description: '负责渠道客户进件录入', dataScope: 'self' },
    { code: 'channel_manager', name: '招商负责人', description: '管理团队进件，审核渠道数据', dataScope: 'team' },
    { code: 'investment_staff', name: '投资专员', description: '投资项目尽调与评估', dataScope: 'self' },
    { code: 'investment_manager', name: '投资负责人', description: '投资决策审批', dataScope: 'region' },
    { code: 'middleware_ops', name: '中台运营', description: '系统运营与数据维护', dataScope: 'region' },
    { code: 'admin', name: '系统管理员', description: '系统全部权限', dataScope: 'all' },
];
const PERMISSIONS_DATA = [
    { code: 'intake:view', name: '查看进件', module: '进件管理' },
    { code: 'intake:create', name: '创建进件', module: '进件管理' },
    { code: 'intake:edit', name: '编辑进件', module: '进件管理' },
    { code: 'intake:delete', name: '删除进件', module: '进件管理' },
    { code: 'intake:submit', name: '提交进件', module: '进件管理' },
    { code: 'review:view', name: '查看评审', module: '评审管理' },
    { code: 'review:approve', name: '审批评审', module: '评审管理' },
    { code: 'review:reject', name: '驳回评审', module: '评审管理' },
    { code: 'review:create', name: '创建评审', module: '评审管理' },
    { code: 'project:view', name: '查看项目', module: '项目管理' },
    { code: 'project:create', name: '创建项目', module: '项目管理' },
    { code: 'project:edit', name: '编辑项目', module: '项目管理' },
    { code: 'project:delete', name: '删除项目', module: '项目管理' },
    { code: 'bi:view', name: '查看报表', module: '数据报表' },
    { code: 'bi:export', name: '导出报表', module: '数据报表' },
    { code: 'user:view', name: '查看用户', module: '系统管理' },
    { code: 'user:create', name: '创建用户', module: '系统管理' },
    { code: 'user:edit', name: '编辑用户', module: '系统管理' },
    { code: 'user:delete', name: '删除用户', module: '系统管理' },
    { code: 'role:view', name: '查看角色', module: '系统管理' },
    { code: 'role:create', name: '创建角色', module: '系统管理' },
    { code: 'role:edit', name: '编辑角色', module: '系统管理' },
    { code: 'role:delete', name: '删除角色', module: '系统管理' },
    { code: 'setting:view', name: '查看配置', module: '系统管理' },
    { code: 'setting:edit', name: '编辑配置', module: '系统管理' },
];
async function seed() {
    await dataSource.initialize();
    console.log('Database connected.');
    const roleRepo = dataSource.getRepository(role_entity_1.Role);
    const permRepo = dataSource.getRepository(permission_entity_1.Permission);
    const userRepo = dataSource.getRepository(user_entity_1.User);
    for (const p of PERMISSIONS_DATA) {
        const exists = await permRepo.findOne({ where: { code: p.code } });
        if (!exists) {
            await permRepo.save(permRepo.create(p));
            console.log(`  Permission created: ${p.code}`);
        }
    }
    const allPermissions = await permRepo.find();
    const adminPermCodes = allPermissions.map((p) => p.code);
    const channelSpecialistPerms = ['intake:view', 'intake:create', 'intake:edit', 'intake:submit'];
    const channelManagerPerms = [...channelSpecialistPerms, 'intake:delete', 'project:view', 'bi:view'];
    const investmentStaffPerms = ['project:view', 'project:create', 'project:edit', 'review:view', 'review:create'];
    const investmentManagerPerms = [...investmentStaffPerms, 'review:approve', 'review:reject', 'bi:view', 'bi:export'];
    const middlewareOpsPerms = ['intake:view', 'project:view', 'bi:view', 'bi:export', 'setting:view', 'setting:edit'];
    const permMap = new Map(allPermissions.map((p) => [p.code, p]));
    for (const r of ROLES_DATA) {
        const exists = await roleRepo.findOne({ where: { code: r.code } });
        let role;
        if (!exists) {
            role = roleRepo.create(r);
        }
        else {
            role = exists;
            Object.assign(role, r);
        }
        let codes = [];
        if (r.code === 'admin')
            codes = adminPermCodes;
        else if (r.code === 'channel_specialist')
            codes = channelSpecialistPerms;
        else if (r.code === 'channel_manager')
            codes = channelManagerPerms;
        else if (r.code === 'investment_staff')
            codes = investmentStaffPerms;
        else if (r.code === 'investment_manager')
            codes = investmentManagerPerms;
        else if (r.code === 'middleware_ops')
            codes = middlewareOpsPerms;
        role.permissions = codes.map((c) => permMap.get(c)).filter(Boolean);
        const saved = await roleRepo.save(role);
        console.log(`  Role ${exists ? 'updated' : 'created'}: ${saved.code} (${saved.permissions.length} perms)`);
    }
    const adminRole = await roleRepo.findOne({ where: { code: 'admin' } });
    const adminExists = await userRepo.findOne({ where: { phone: '13800000000' } });
    if (!adminExists) {
        const hashed = await bcrypt.hash('123456', 10);
        const admin = userRepo.create({
            phone: '13800000000',
            password: hashed,
            name: '超级管理员',
            email: 'admin@example.com',
            isActive: true,
            roles: adminRole ? [adminRole] : [],
        });
        await userRepo.save(admin);
        console.log('  Admin user created: 13800000000 / 123456');
    }
    else {
        console.log('  Admin user already exists.');
    }
    await dataSource.destroy();
    console.log('Seed completed.');
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map