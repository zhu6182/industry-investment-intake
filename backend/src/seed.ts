import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from './entities/user.entity';
import { Region } from './entities/region.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const roleRepo = app.get(getRepositoryToken(Role));
  const permRepo = app.get(getRepositoryToken(Permission));
  const userRepo = app.get(getRepositoryToken(User));
  const regionRepo = app.get(getRepositoryToken(Region));

  const roles = [
    { code: 'admin', name: '系统管理员', dataScope: 'all' },
    { code: 'middleware_ops', name: '中台运营', dataScope: 'all' },
    { code: 'channel_specialist', name: '渠道专员', dataScope: 'own' },
    { code: 'channel_manager', name: '渠道主管', dataScope: 'team' },
    { code: 'investment_staff', name: '招商人员', dataScope: 'own' },
    { code: 'investment_manager', name: '招商主管', dataScope: 'region' },
  ];

  const permissions = [
    { code: 'intake:create', name: '创建进件', module: 'intake' },
    { code: 'intake:view', name: '查看进件', module: 'intake' },
    { code: 'intake:edit', name: '编辑进件', module: 'intake' },
    { code: 'review:view', name: '查看审核', module: 'review' },
    { code: 'review:approve', name: '审核通过', module: 'review' },
    { code: 'review:reject', name: '审核驳回', module: 'review' },
    { code: 'report:view', name: '查看报告', module: 'report' },
    { code: 'followup:create', name: '创建跟进', module: 'followup' },
    { code: 'visit:create', name: '创建拜访', module: 'visit' },
    { code: 'bi:view', name: '查看BI大屏', module: 'bi' },
    { code: 'region:manage', name: '管理园区', module: 'region' },
    { code: 'user:manage', name: '管理用户', module: 'user' },
    { code: 'role:manage', name: '管理角色', module: 'role' },
    { code: 'ranking:view', name: '查看排行榜', module: 'ranking' },
  ];

  console.log('📌 Seeding permissions...');
  for (const p of permissions) {
    const existing = await permRepo.findOne({ where: { code: p.code } });
    if (!existing) {
      await permRepo.save(permRepo.create(p));
    }
  }

  console.log('📌 Seeding roles...');
  const savedRoles: Role[] = [];
  for (const r of roles) {
    const existing = await roleRepo.findOne({ where: { code: r.code } });
    if (!existing) {
      const saved = await roleRepo.save(roleRepo.create(r));
      savedRoles.push(saved);
    } else {
      savedRoles.push(existing);
    }
  }

  const adminRole = savedRoles.find((r) => r.code === 'admin');
  const allPerms = await permRepo.find();
  adminRole!.permissions = allPerms;
  await roleRepo.save(adminRole!);

  console.log('📌 Seeding regions...');
  const regions = [
    { name: '北京市', level: 1 },
    { name: '上海市', level: 1 },
    { name: '广东省', level: 1 },
    { name: '深圳市', level: 2 },
    { name: '广州市', level: 2 },
    { name: '江苏省', level: 1 },
    { name: '南京市', level: 2 },
    { name: '苏州市', level: 2 },
    { name: '浙江省', level: 1 },
    { name: '杭州市', level: 2 },
  ];
  for (const rg of regions) {
    const existing = await regionRepo.findOne({ where: { name: rg.name } });
    if (!existing) {
      await regionRepo.save(regionRepo.create(rg));
    }
  }

  console.log('📌 Seeding users...');
  const users = [
    { phone: '13800000000', password: 'admin123', name: '系统管理员', roleCode: 'admin' },
    { phone: '13800000001', password: 'admin123', name: '中台运营小王', roleCode: 'middleware_ops' },
    { phone: '13800000002', password: 'admin123', name: '渠道专员张三', roleCode: 'channel_specialist' },
    { phone: '13800000003', password: 'admin123', name: '渠道主管李四', roleCode: 'channel_manager' },
    { phone: '13800000004', password: 'admin123', name: '招商人员王五', roleCode: 'investment_staff' },
    { phone: '13800000005', password: 'admin123', name: '招商主管赵六', roleCode: 'investment_manager' },
  ];

  for (const u of users) {
    const existing = await userRepo.findOne({ where: { phone: u.phone } });
    const role = savedRoles.find((r) => r.code === u.roleCode);
    if (existing) {
      existing.roles = role ? [role] : [];
      await userRepo.save(existing);
    } else {
      const hashed = await bcrypt.hash(u.password, 10);
      const newUser = userRepo.create({
        phone: u.phone,
        password: hashed,
        name: u.name,
        roles: role ? [role] : [],
      });
      await userRepo.save(newUser);
    }
  }

  console.log('\n✅ Seed complete!');
  console.log('Test accounts (password: admin123):');
  users.forEach((u) => console.log(`  ${u.name}: ${u.phone} (${u.roleCode})`));

  await app.close();
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});

