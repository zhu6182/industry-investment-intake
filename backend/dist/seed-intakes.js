"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const intake_entity_1 = require("./entities/intake.entity");
const region_entity_1 = require("./entities/region.entity");
const user_entity_1 = require("./entities/user.entity");
const visit_entity_1 = require("./entities/visit.entity");
const follow_up_entity_1 = require("./entities/follow-up.entity");
const typeorm_1 = require("@nestjs/typeorm");
const COMPANIES = [
    { name: '北京智能科技有限公司', region: '北京市', industry: '人工智能', area: 1200, status: 'landed' },
    { name: '上海云端数据服务公司', region: '上海市', industry: '云计算', area: 800, status: 'landed' },
    { name: '深圳新能源动力有限公司', region: '深圳市', industry: '新能源', area: 3500, status: 'landed' },
    { name: '广州生物医药科技公司', region: '广州市', industry: '生物医药', area: 2000, status: 'following' },
    { name: '杭州电子商务集团有限公司', region: '杭州市', industry: '电子商务', area: 1500, status: 'landed' },
    { name: '苏州智能制造装备公司', region: '苏州市', industry: '智能制造', area: 5000, status: 'approved' },
    { name: '南京软件研发有限公司', region: '南京市', industry: '软件开发', area: 900, status: 'landed' },
    { name: '北京大数据分析中心', region: '北京市', industry: '大数据', area: 1800, status: 'landed' },
    { name: '上海半导体设计公司', region: '上海市', industry: '集成电路', area: 2500, status: 'following' },
    { name: '深圳机器人科技公司', region: '深圳市', industry: '智能制造', area: 4200, status: 'pending' },
    { name: '杭州人工智能研究院', region: '杭州市', industry: '人工智能', area: 1100, status: 'landed' },
    { name: '广州新材料科技公司', region: '广州市', industry: '新材料', area: 6000, status: 'approved' },
    { name: '苏州生物技术公司', region: '苏州市', industry: '生物医药', area: 2800, status: 'following' },
    { name: '南京新能源公司', region: '南京市', industry: '新能源', area: 3500, status: 'landed' },
    { name: '上海跨境电商公司', region: '上海市', industry: '电子商务', area: 1200, status: 'lost' },
    { name: '北京半导体设备公司', region: '北京市', industry: '集成电路', area: 4500, status: 'pending' },
    { name: '深圳医疗器械公司', region: '深圳市', industry: '生物医药', area: 2200, status: 'approved' },
    { name: '杭州云计算服务公司', region: '杭州市', industry: '云计算', area: 1700, status: 'landed' },
    { name: '广州智能装备公司', region: '广州市', industry: '智能制造', area: 3800, status: 'following' },
    { name: '上海文化创意公司', region: '上海市', industry: '文化创意', area: 600, status: 'rejected' },
    { name: '北京教育培训公司', region: '北京市', industry: '教育培训', area: 950, status: 'assigned' },
    { name: '深圳金融服务公司', region: '深圳市', industry: '金融服务', area: 1600, status: 'landed' },
    { name: '南京软件外包公司', region: '南京市', industry: '软件开发', area: 750, status: 'following' },
    { name: '杭州数字传媒公司', region: '杭州市', industry: '文化创意', area: 1300, status: 'approved' },
    { name: '苏州精密制造公司', region: '苏州市', industry: '智能制造', area: 5200, status: 'landed' },
    { name: '上海海洋工程公司', region: '上海市', industry: '海洋工程', area: 8000, status: 'landed' },
    { name: '北京环境科技公司', region: '北京市', industry: '节能环保', area: 2400, status: 'following' },
    { name: '深圳无人机科技公司', region: '深圳市', industry: '智能制造', area: 1900, status: 'pending' },
    { name: '广州食品科技公司', region: '广州市', industry: '食品科技', area: 3300, status: 'approved' },
    { name: '杭州物联网公司', region: '杭州市', industry: '物联网', area: 1450, status: 'landed' },
    { name: '上海金融科技公司', region: '上海市', industry: '金融服务', area: 2100, status: 'following' },
    { name: '北京汽车电子公司', region: '北京市', industry: '汽车电子', area: 4800, status: 'landed' },
    { name: '深圳光电子公司', region: '深圳市', industry: '集成电路', area: 2900, status: 'approved' },
    { name: '苏州医疗器械公司', region: '苏州市', industry: '生物医药', area: 1700, status: 'landed' },
    { name: '南京智能交通公司', region: '南京市', industry: '智能交通', area: 2600, status: 'following' },
];
const LEGAL_PERSONS = ['张伟', '李娜', '王强', '刘洋', '陈静', '杨帆', '黄磊', '周敏', '吴昊', '徐丽', '孙明', '马涛', '朱琳', '胡军', '林峰'];
function randomDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
    return d;
}
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const intakeRepo = app.get((0, typeorm_1.getRepositoryToken)(intake_entity_1.Intake));
    const regionRepo = app.get((0, typeorm_1.getRepositoryToken)(region_entity_1.Region));
    const userRepo = app.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
    const visitRepo = app.get((0, typeorm_1.getRepositoryToken)(visit_entity_1.Visit));
    const followUpRepo = app.get((0, typeorm_1.getRepositoryToken)(follow_up_entity_1.FollowUp));
    console.log('🗑  Cleaning old demo data...');
    await intakeRepo.createQueryBuilder().delete().execute();
    await visitRepo.createQueryBuilder().delete().execute();
    await followUpRepo.createQueryBuilder().delete().execute();
    console.log('📍 Loading regions and users...');
    const regions = await regionRepo.find();
    const regionByName = new Map(regions.map((r) => [r.name, r]));
    const admin = await userRepo.findOne({ where: { phone: '13800000000' } });
    const channelSpec = await userRepo.findOne({ where: { phone: '13800000002' } });
    const invStaff = await userRepo.findOne({ where: { phone: '13800000004' } });
    const invManager = await userRepo.findOne({ where: { phone: '13800000005' } });
    if (!admin || !channelSpec || !invStaff || !invManager) {
        throw new Error('Required seed users not found, run seed.js first');
    }
    const users = [admin, channelSpec, invStaff, invManager];
    console.log('📝 Creating intakes...');
    let count = 0;
    for (let i = 0; i < COMPANIES.length; i++) {
        const c = COMPANIES[i];
        const daysAgo = Math.floor(Math.random() * 28) + 1;
        const createdAt = randomDate(daysAgo);
        const applicant = users[i % users.length];
        const assignedTo = c.status === 'landed' || c.status === 'following' || c.status === 'approved' ? invStaff : null;
        const intake = intakeRepo.create({
            companyName: c.name,
            creditCode: '91' + String(Math.floor(Math.random() * 1000000000000000)).padStart(16, '0'),
            legalPerson: LEGAL_PERSONS[i % LEGAL_PERSONS.length],
            establishDate: '20' + String(5 + Math.floor(Math.random() * 18)).padStart(2, '0') + '-' + String(1 + Math.floor(Math.random() * 12)).padStart(2, '0') + '-' + String(1 + Math.floor(Math.random() * 28)).padStart(2, '0'),
            industry: c.industry,
            shareholders: '主要股东：张伟（60%）、李娜（40%）',
            applicationRegionId: regionByName.get(c.region)?.id || null,
            area: c.area,
            status: c.status,
            applicantId: applicant.id,
            assignedToId: assignedTo?.id || null,
        });
        intake.createdAt = createdAt;
        intake.updatedAt = c.status === 'landed' ? randomDate(Math.max(0, daysAgo - 3)) : createdAt;
        await intakeRepo.save(intake);
        count++;
        if (c.status === 'landed' && Math.random() > 0.5) {
            const visit = visitRepo.create({
                intakeId: intake.id,
                visitDate: randomDate(Math.max(0, daysAgo - 2)),
                visitLocation: c.region + '市' + ['高新区', '经开区', '工业园'][i % 3] + 'XX路128号',
                visitContent: '实地考察企业经营状况、厂房面积、生产能力等',
                photos: [],
                applicationRegionId: intake.applicationRegionId,
                area: c.area,
                operatorId: invStaff.id,
            });
            visit.createdAt = visit.visitDate;
            await visitRepo.save(visit);
        }
        if (c.status === 'following' || c.status === 'landed') {
            const fuCount = 1 + Math.floor(Math.random() * 3);
            for (let j = 0; j < fuCount; j++) {
                const fuDate = randomDate(Math.max(0, daysAgo - j));
                const methods = ['phone', 'wechat', 'email', 'onsite'];
                const results = ['interested', 'negotiating', 'pending_decision'];
                const fu = followUpRepo.create({
                    intakeId: intake.id,
                    method: methods[j % methods.length],
                    content: ['初步沟通，了解企业需求', '邀请企业实地考察园区', '商讨落地细节及优惠政策', '确认入驻意向'][j % 4],
                    followDate: fuDate,
                    photos: [],
                    result: results[j % results.length],
                    nextStep: ['安排再次拜访', '准备投资协议', '协调政策对接', '跟进审批进度'][j % 4],
                    operatorId: invStaff.id,
                });
                fu.createdAt = fuDate;
                await followUpRepo.save(fu);
            }
        }
    }
    console.log(`✅ Created ${count} intakes with visits and follow-ups`);
    console.log('📊 Status distribution:');
    const dist = await intakeRepo.createQueryBuilder('i').select('i.status', 'status').addSelect('COUNT(*)', 'count').groupBy('i.status').getRawMany();
    dist.forEach((d) => console.log(`  ${d.status}: ${d.count}`));
    console.log('🏙  Region distribution:');
    const regDist = await intakeRepo.createQueryBuilder('i').select('i.applicationRegionId', 'rid').addSelect('COUNT(*)', 'count').groupBy('i.applicationRegionId').getRawMany();
    for (const d of regDist) {
        const r = regions.find((x) => x.id === d.rid);
        console.log(`  ${r ? r.name : '未分配'}: ${d.count}`);
    }
    await app.close();
}
seed().catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
});
//# sourceMappingURL=seed-intakes.js.map