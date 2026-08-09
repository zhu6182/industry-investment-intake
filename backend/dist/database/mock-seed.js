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
const intake_entity_1 = require("../entities/intake.entity");
const intake_file_entity_1 = require("../entities/intake-file.entity");
const review_entity_1 = require("../entities/review.entity");
const report_entity_1 = require("../entities/report.entity");
const follow_up_entity_1 = require("../entities/follow-up.entity");
const visit_entity_1 = require("../entities/visit.entity");
const referral_entity_1 = require("../entities/referral.entity");
const setting_entity_1 = require("../entities/setting.entity");
const region_entity_1 = require("../entities/region.entity");
const dataSource = new typeorm_1.DataSource({
    type: 'better-sqlite3',
    database: './data.db',
    entities: [user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, region_entity_1.Region, intake_entity_1.Intake, intake_file_entity_1.IntakeFile, review_entity_1.Review, report_entity_1.Report, follow_up_entity_1.FollowUp, visit_entity_1.Visit, setting_entity_1.Setting, referral_entity_1.Referral],
    synchronize: false,
});
const USERS_DATA = [
    { phone: '13900000001', name: '张伟', email: 'zhangwei@example.com', roleCode: 'channel_specialist', regionId: 14 },
    { phone: '13900000010', name: '李娜', email: 'lina@example.com', roleCode: 'channel_specialist', regionId: 17 },
    { phone: '13900000011', name: '王强', email: 'wangqiang@example.com', roleCode: 'channel_specialist', regionId: 20 },
    { phone: '13900000002', name: '刘洋', email: 'liuyang@example.com', roleCode: 'channel_manager', regionId: 14 },
    { phone: '13900000012', name: '陈静', email: 'chenjing@example.com', roleCode: 'channel_manager', regionId: 17 },
    { phone: '13900000003', name: '赵明', email: 'zhaoming@example.com', roleCode: 'investment_staff', regionId: 14 },
    { phone: '13900000013', name: '孙丽', email: 'sunli@example.com', roleCode: 'investment_staff', regionId: 17 },
    { phone: '13900000004', name: '周杰', email: 'zhoujie@example.com', roleCode: 'investment_manager', regionId: 14 },
    { phone: '13900000014', name: '吴芳', email: 'wufang@example.com', roleCode: 'investment_manager', regionId: 17 },
    { phone: '13900000005', name: '郑涛', email: 'zhengtao@example.com', roleCode: 'middleware_ops', regionId: 14 },
    { phone: '13900000015', name: '冯雪', email: 'fengxue@example.com', roleCode: 'middleware_ops', regionId: 17 },
];
const COMPANIES_DATA = [
    {
        companyName: '杭州灵犀智能科技有限公司', creditCode: '91330110MA2JK5678X', legalPerson: '王建明',
        establishDate: '2022-03-08', industry: '人工智能',
        shareholders: JSON.stringify([{ name: '王建明', ratio: '25.00' }, { name: '李建国', ratio: '22.00' }, { name: '深圳华信资本合伙企业(有限合伙)', ratio: '53.00' }]),
        area: 500, status: 'following', applicantPhone: '13900000001', assignedToPhone: '13900000003',
        regionId: 14, tycValidation: { isValid: true, rating: 39, reasons: [] }, daysAgo: 25,
    },
    {
        companyName: '上海芯盾网络安全技术有限公司', creditCode: '91310115MA1K3P9123Y', legalPerson: '刘海涛',
        establishDate: '2020-07-15', industry: '网络安全',
        shareholders: JSON.stringify([{ name: '刘海涛', ratio: '40.00' }, { name: '张红梅', ratio: '30.00' }, { name: '北京创新投资有限公司', ratio: '30.00' }]),
        area: 800, status: 'approved', applicantPhone: '13900000001',
        regionId: 14, tycValidation: { isValid: true, rating: 72, reasons: [] }, daysAgo: 15,
    },
    {
        companyName: '深圳云图大数据科技有限公司', creditCode: '91440300MA5G8X2345Z', legalPerson: '陈晓峰',
        establishDate: '2019-11-20', industry: '大数据',
        shareholders: JSON.stringify([{ name: '陈晓峰', ratio: '35.00' }, { name: '马云飞', ratio: '25.00' }, { name: '红杉资本中国', ratio: '40.00' }]),
        area: 1200, status: 'landed', applicantPhone: '13900000001', assignedToPhone: '13900000004',
        regionId: 14, tycValidation: { isValid: true, rating: 85, reasons: [] }, daysAgo: 90,
    },
    {
        companyName: '杭州绿能环保科技有限公司', creditCode: '91330106MA2H9T6789A', legalPerson: '赵德华',
        establishDate: '2021-05-10', industry: '节能环保',
        shareholders: JSON.stringify([{ name: '赵德华', ratio: '50.00' }, { name: '钱多多', ratio: '50.00' }]),
        area: 300, status: 'pending', applicantPhone: '13900000001',
        regionId: 14, tycValidation: { isValid: true, rating: 55, reasons: [] }, daysAgo: 3,
    },
    {
        companyName: '上海微创医疗机器人有限公司', creditCode: '91310104MA1F7Y3456B', legalPerson: '孙宏斌',
        establishDate: '2018-09-12', industry: '医疗器械',
        shareholders: JSON.stringify([{ name: '孙宏斌', ratio: '30.00' }, { name: '高瓴资本', ratio: '45.00' }, { name: '上海科创基金', ratio: '25.00' }]),
        area: 2000, status: 'assigned', applicantPhone: '13900000001', assignedToPhone: '13900000013',
        regionId: 14, tycValidation: { isValid: true, rating: 91, reasons: [] }, daysAgo: 40,
    },
    {
        companyName: '深圳前海区块链科技有限公司', creditCode: '91440300MA5DN7456C', legalPerson: '林俊杰',
        establishDate: '2020-03-25', industry: '区块链',
        shareholders: JSON.stringify([{ name: '林俊杰', ratio: '45.00' }, { name: '徐小平', ratio: '55.00' }]),
        area: 600, status: 'following', applicantPhone: '13900000010', assignedToPhone: '13900000013',
        regionId: 17, tycValidation: { isValid: true, rating: 62, reasons: [] }, daysAgo: 20,
    },
    {
        companyName: '广州智能驾驶科技有限公司', creditCode: '91440101MA9U8W7890D', legalPerson: '黄志强',
        establishDate: '2017-06-18', industry: '智能驾驶',
        shareholders: JSON.stringify([{ name: '黄志强', ratio: '28.00' }, { name: '百度风投', ratio: '42.00' }, { name: 'IDG资本', ratio: '30.00' }]),
        area: 1500, status: 'landed', applicantPhone: '13900000010', assignedToPhone: '13900000014',
        regionId: 17, tycValidation: { isValid: true, rating: 88, reasons: [] }, daysAgo: 120,
    },
    {
        companyName: '深圳量子云通信有限公司', creditCode: '91440300MA5K2L1122E', legalPerson: '吴志远',
        establishDate: '2021-12-05', industry: '量子通信',
        shareholders: JSON.stringify([{ name: '吴志远', ratio: '35.00' }, { name: '中科院创投', ratio: '65.00' }]),
        area: 450, status: 'rejected', applicantPhone: '13900000010',
        regionId: 17, rejectReason: '企业注册时间不足2年，不符合准入条件',
        tycValidation: { isValid: false, rating: 25, reasons: ['注册时间不足2年'] }, daysAgo: 10,
    },
    {
        companyName: '佛山智能制造装备有限公司', creditCode: '91440600MA4W5R3344F', legalPerson: '何建辉',
        establishDate: '2016-04-20', industry: '智能制造',
        shareholders: JSON.stringify([{ name: '何建辉', ratio: '40.00' }, { name: '碧桂园创投', ratio: '35.00' }, { name: '佛山产业基金', ratio: '25.00' }]),
        area: 3000, status: 'approved', applicantPhone: '13900000010',
        regionId: 18, tycValidation: { isValid: true, rating: 78, reasons: [] }, daysAgo: 18,
    },
    {
        companyName: '苏州纳米材料科技有限公司', creditCode: '91320505MA2X7N5566G', legalPerson: '马晓龙',
        establishDate: '2019-08-30', industry: '新材料',
        shareholders: JSON.stringify([{ name: '马晓龙', ratio: '32.00' }, { name: '苏州元禾控股', ratio: '48.00' }, { name: '华润资本', ratio: '20.00' }]),
        area: 1000, status: 'following', applicantPhone: '13900000011', assignedToPhone: '13900000003',
        regionId: 20, tycValidation: { isValid: true, rating: 70, reasons: [] }, daysAgo: 30,
    },
    {
        companyName: '无锡物联网技术有限公司', creditCode: '91320200MA1W9P7788H', legalPerson: '杨振华',
        establishDate: '2018-02-14', industry: '物联网',
        shareholders: JSON.stringify([{ name: '杨振华', ratio: '38.00' }, { name: '无锡产业集团', ratio: '62.00' }]),
        area: 700, status: 'lost', applicantPhone: '13900000011',
        regionId: 21, rejectReason: '企业选择落地其他园区',
        tycValidation: { isValid: true, rating: 60, reasons: [] }, daysAgo: 60,
    },
    {
        companyName: '南京生物医药研究有限公司', creditCode: '91320100MA2B3T9900J', legalPerson: '徐海明',
        establishDate: '2015-11-08', industry: '生物医药',
        shareholders: JSON.stringify([{ name: '徐海明', ratio: '25.00' }, { name: '礼来亚洲基金', ratio: '40.00' }, { name: '启明创投', ratio: '35.00' }]),
        area: 2500, status: 'landed', applicantPhone: '13900000011', assignedToPhone: '13900000004',
        regionId: 19, tycValidation: { isValid: true, rating: 95, reasons: [] }, daysAgo: 150,
    },
    {
        companyName: '苏州集成电路设计有限公司', creditCode: '91320500MA3K5L2233K', legalPerson: '朱国栋',
        establishDate: '2017-09-22', industry: '集成电路',
        shareholders: JSON.stringify([{ name: '朱国栋', ratio: '30.00' }, { name: '大基金二期', ratio: '50.00' }, { name: '武岳峰资本', ratio: '20.00' }]),
        area: 1800, status: 'pending', applicantPhone: '13900000011',
        regionId: 20, tycValidation: { isValid: true, rating: 82, reasons: [] }, daysAgo: 5,
    },
    {
        companyName: '北京星河航天科技有限公司', creditCode: '91110108MA01X74455L', legalPerson: '钱学林',
        establishDate: '2016-07-03', industry: '航空航天',
        shareholders: JSON.stringify([{ name: '钱学林', ratio: '28.00' }, { name: '经纬中国', ratio: '42.00' }, { name: '深创投', ratio: '30.00' }]),
        area: 3500, status: 'following', applicantPhone: '13900000001', assignedToPhone: '13900000003',
        regionId: 13, tycValidation: { isValid: true, rating: 89, reasons: [] }, daysAgo: 35,
    },
    {
        companyName: '上海商汤智算科技有限公司', creditCode: '91310115MA7K9L6677M', legalPerson: '徐立',
        establishDate: '2014-10-15', industry: '人工智能',
        shareholders: JSON.stringify([{ name: '徐立', ratio: '20.00' }, { name: '软银愿景基金', ratio: '45.00' }, { name: '阿里巴巴', ratio: '35.00' }]),
        area: 5000, status: 'landed', applicantPhone: '13900000010', assignedToPhone: '13900000014',
        regionId: 14, tycValidation: { isValid: true, rating: 98, reasons: [] }, daysAgo: 200,
    },
    {
        companyName: '深圳优必选机器人有限公司', creditCode: '91440300MA5D6L8899N', legalPerson: '周剑',
        establishDate: '2012-05-20', industry: '机器人',
        shareholders: JSON.stringify([{ name: '周剑', ratio: '22.00' }, { name: '腾讯投资', ratio: '40.00' }, { name: '鼎晖投资', ratio: '38.00' }]),
        area: 4000, status: 'approved', applicantPhone: '13900000011',
        regionId: 17, tycValidation: { isValid: true, rating: 93, reasons: [] }, daysAgo: 12,
    },
    {
        companyName: '杭州涂鸦智能科技有限公司', creditCode: '91330106MA2H8P0011P', legalPerson: '王学集',
        establishDate: '2014-12-10', industry: '物联网',
        shareholders: JSON.stringify([{ name: '王学集', ratio: '25.00' }, { name: 'NEA恩颐投资', ratio: '40.00' }, { name: '腾讯投资', ratio: '35.00' }]),
        area: 2200, status: 'assigned', applicantPhone: '13900000001', assignedToPhone: '13900000013',
        regionId: 14, tycValidation: { isValid: true, rating: 87, reasons: [] }, daysAgo: 8,
    },
    {
        companyName: '广州文远知行科技有限公司', creditCode: '91440101MA9C7W2233Q', legalPerson: '韩旭',
        establishDate: '2017-04-18', industry: '自动驾驶',
        shareholders: JSON.stringify([{ name: '韩旭', ratio: '18.00' }, { name: '启明创投', ratio: '35.00' }, { name: '宇通集团', ratio: '47.00' }]),
        area: 1800, status: 'following', applicantPhone: '13900000010', assignedToPhone: '13900000003',
        regionId: 16, tycValidation: { isValid: true, rating: 80, reasons: [] }, daysAgo: 22,
    },
    {
        companyName: '南京晶能新能源有限公司', creditCode: '91320100MA2M5N3344R', legalPerson: '蒋明',
        establishDate: '2018-11-25', industry: '新能源',
        shareholders: JSON.stringify([{ name: '蒋明', ratio: '33.00' }, { name: '宁德时代', ratio: '50.00' }, { name: '江苏高投', ratio: '17.00' }]),
        area: 5000, status: 'pending', applicantPhone: '13900000011',
        regionId: 19, tycValidation: { isValid: true, rating: 76, reasons: [] }, daysAgo: 2,
    },
    {
        companyName: '上海壁仞集成电路有限公司', creditCode: '91310115MA1F9P4455S', legalPerson: '焦国方',
        establishDate: '2019-03-15', industry: '集成电路',
        shareholders: JSON.stringify([{ name: '焦国方', ratio: '20.00' }, { name: '高瓴资本', ratio: '45.00' }, { name: '中国互联网投资基金', ratio: '35.00' }]),
        area: 3000, status: 'approved', applicantPhone: '13900000001', assignedToPhone: '13900000004',
        regionId: 14, tycValidation: { isValid: true, rating: 84, reasons: [] }, daysAgo: 16,
    },
];
const FOLLOWUP_TEMPLATES = [
    { method: 'phone', content: '电话沟通了企业落户意向，对方表示对园区政策比较感兴趣，希望进一步了解税收优惠和人才补贴政策。', result: 'interested', nextStep: '安排下周线下拜访，准备政策材料' },
    { method: 'wechat', content: '微信发送了园区宣传资料和优惠政策汇总，企业方已查阅并回复了几个关于厂房租金的问题。', result: 'negotiating', nextStep: '根据需求匹配厂房，安排实地看房' },
    { method: 'onsite', content: '实地拜访企业总部，与CEO和CFO进行了深入交流。企业对园区区位优势满意，重点关注供应链配套和员工住宿问题。', result: 'negotiating', nextStep: '协调供应链资源，提供住宿方案' },
    { method: 'phone', content: '电话跟进谈判进度，企业方表示董事会正在讨论，预计两周内给出最终决定。', result: 'pending_decision', nextStep: '保持跟进，准备协议草案' },
    { method: 'email', content: '邮件发送了入驻协议草案，企业法务部门正在审核条款，提出几处修改意见。', result: 'negotiating', nextStep: '法务对接修改协议' },
    { method: 'phone', content: '电话沟通后企业表示由于资金问题暂时搁置搬迁计划，希望明年再谈。', result: 'not_interested', nextStep: '半年后再跟进' },
    { method: 'onsite', content: '陪同企业参观了园区标准化厂房和研发中心，企业对硬件设施表示认可，已初步选定3号楼作为目标场地。', result: 'interested', nextStep: '签订意向协议，推进正式合同' },
    { method: 'wechat', content: '微信沟通了工商注册变更流程，企业已准备材料提交，预计本周完成注册。', result: 'pending_decision', nextStep: '协助办理工商税务登记' },
];
const VISIT_TEMPLATES = [
    { visitLocation: '企业总部 - 上海浦东张江高科技园区', visitContent: '拜访企业总部，与创始人团队深入交流企业发展战略和落地需求。参观了研发中心和生产车间，了解企业当前规模和未来扩张计划。企业对园区的产业配套和人才政策表示满意。' },
    { visitLocation: '企业研发中心 - 深圳南山科技园', visitContent: '考察企业研发实力和技术团队。企业拥有核心专利20余项，研发人员占比超60%。对园区的科研补贴政策很感兴趣，希望对接高校资源。' },
    { visitLocation: '生产基地 - 苏州工业园区', visitContent: '参观企业现有生产基地，了解产能规模和设备情况。企业计划新增2条产线，需要约2000平米厂房。讨论了厂房定制方案和装修补贴。' },
    { visitLocation: '企业总部 - 北京海淀区中关村', visitContent: '与企业CEO进行战略对话，了解融资进展和上市计划。企业B轮融资5亿元，估值30亿，计划3年内申报科创板。园区上市辅导资源是核心吸引力。' },
    { visitLocation: '区域办事处 - 广州天河区', visitContent: '拜访企业华南区负责人，了解区域业务布局。企业计划在华南设立研发中心，需要约800平米办公场地和人才招聘支持。' },
    { visitLocation: '生产基地 - 佛山顺德', visitContent: '考察企业智能制造产线，了解自动化水平。企业引进了工业4.0标准产线，对园区的数字化基础设施有较高要求。' },
];
async function seed() {
    await dataSource.initialize();
    console.log('Database connected.');
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const roleRepo = dataSource.getRepository(role_entity_1.Role);
    const intakeRepo = dataSource.getRepository(intake_entity_1.Intake);
    const followUpRepo = dataSource.getRepository(follow_up_entity_1.FollowUp);
    const visitRepo = dataSource.getRepository(visit_entity_1.Visit);
    const referralRepo = dataSource.getRepository(referral_entity_1.Referral);
    console.log('\n--- Creating users ---');
    const hashedPassword = await bcrypt.hash('123456', 10);
    const userMap = new Map();
    for (const u of USERS_DATA) {
        const role = await roleRepo.findOne({ where: { code: u.roleCode } });
        if (!role) {
            console.log(`  Role not found: ${u.roleCode}, skipping ${u.name}`);
            continue;
        }
        let user = await userRepo.findOne({ where: { phone: u.phone } });
        if (!user) {
            user = new user_entity_1.User();
            user.phone = u.phone;
            user.password = hashedPassword;
            user.name = u.name;
            user.email = u.email || undefined;
            user.isActive = true;
            user.regionId = u.regionId || null;
            user.roles = [role];
            await userRepo.save(user);
            console.log(`  User created: ${u.phone} / ${u.name} (${u.roleCode})`);
        }
        else {
            user.roles = [role];
            user.regionId = u.regionId || null;
            user.name = u.name;
            user.password = hashedPassword;
            await userRepo.save(user);
            console.log(`  User updated: ${u.phone} / ${u.name} (${u.roleCode})`);
        }
        userMap.set(u.phone, user);
    }
    console.log('\n--- Creating intakes ---');
    const intakeMap = new Map();
    for (const c of COMPANIES_DATA) {
        const applicant = userMap.get(c.applicantPhone);
        if (!applicant) {
            console.log(`  Applicant not found: ${c.applicantPhone}, skipping ${c.companyName}`);
            continue;
        }
        const assignedTo = c.assignedToPhone ? userMap.get(c.assignedToPhone) : undefined;
        const existing = await intakeRepo.findOne({ where: { companyName: c.companyName } });
        if (existing) {
            console.log(`  Intake exists: ${c.companyName}, skipping`);
            intakeMap.set(c.companyName, existing.id);
            continue;
        }
        const createdAt = new Date(Date.now() - c.daysAgo * 24 * 60 * 60 * 1000);
        const result = await intakeRepo
            .createQueryBuilder()
            .insert()
            .into(intake_entity_1.Intake)
            .values({
            companyName: c.companyName,
            creditCode: c.creditCode,
            legalPerson: c.legalPerson,
            establishDate: c.establishDate,
            industry: c.industry,
            shareholders: c.shareholders,
            applicationRegionId: c.regionId,
            area: c.area,
            status: c.status,
            rejectReason: c.rejectReason || undefined,
            tycValidation: c.tycValidation ? JSON.stringify(c.tycValidation) : undefined,
            applicant: { id: applicant.id },
            assignedTo: assignedTo ? { id: assignedTo.id } : undefined,
            createdAt,
            updatedAt: new Date(),
        })
            .execute();
        const intakeId = result.identifiers[0].id;
        intakeMap.set(c.companyName, intakeId);
        console.log(`  Intake created: ${c.companyName} (${c.status}) id=${intakeId}`);
    }
    console.log('\n--- Creating follow-ups ---');
    let fuCount = 0;
    for (const c of COMPANIES_DATA) {
        const intakeId = intakeMap.get(c.companyName);
        if (!intakeId)
            continue;
        if (c.status === 'pending')
            continue;
        const applicant = userMap.get(c.applicantPhone);
        const assignedTo = c.assignedToPhone ? userMap.get(c.assignedToPhone) : applicant;
        const operatorId = assignedTo.id;
        const fuCountForThis = c.status === 'landed' ? 4 :
            c.status === 'following' ? 3 :
                c.status === 'assigned' || c.status === 'approved' ? 2 : 1;
        for (let i = 0; i < fuCountForThis; i++) {
            const tpl = FOLLOWUP_TEMPLATES[(i + intakeId) % FOLLOWUP_TEMPLATES.length];
            const followDate = new Date(Date.now() - (c.daysAgo - i * 5 - 3) * 24 * 60 * 60 * 1000);
            const existing = await followUpRepo.findOne({
                where: { intakeId, content: tpl.content },
            });
            if (existing)
                continue;
            const fu = new follow_up_entity_1.FollowUp();
            fu.intakeId = intakeId;
            fu.operator = { id: operatorId };
            fu.method = tpl.method;
            fu.content = tpl.content;
            fu.followDate = followDate;
            fu.result = tpl.result;
            fu.nextStep = tpl.nextStep;
            await followUpRepo.save(fu);
            fuCount++;
        }
    }
    console.log(`  Follow-ups created: ${fuCount}`);
    console.log('\n--- Creating visits ---');
    let visitCount = 0;
    for (const c of COMPANIES_DATA) {
        const intakeId = intakeMap.get(c.companyName);
        if (!intakeId)
            continue;
        if (!['following', 'approved', 'landed', 'assigned'].includes(c.status))
            continue;
        const applicant = userMap.get(c.applicantPhone);
        const assignedTo = c.assignedToPhone ? userMap.get(c.assignedToPhone) : applicant;
        const operatorId = assignedTo.id;
        const visitCountForThis = c.status === 'landed' ? 2 : 1;
        for (let i = 0; i < visitCountForThis; i++) {
            const tpl = VISIT_TEMPLATES[(i + intakeId) % VISIT_TEMPLATES.length];
            const visitDate = new Date(Date.now() - (c.daysAgo - i * 7 - 5) * 24 * 60 * 60 * 1000);
            const existing = await visitRepo.findOne({
                where: { intakeId, visitLocation: tpl.visitLocation },
            });
            if (existing)
                continue;
            const visit = new visit_entity_1.Visit();
            visit.intakeId = intakeId;
            visit.operator = { id: operatorId };
            visit.visitDate = visitDate;
            visit.visitLocation = tpl.visitLocation;
            visit.visitContent = tpl.visitContent;
            visit.applicationRegionId = c.regionId;
            visit.area = c.area;
            await visitRepo.save(visit);
            visitCount++;
        }
    }
    console.log(`  Visits created: ${visitCount}`);
    console.log('\n--- Creating referrals ---');
    let refCount = 0;
    const referralPairs = [
        { companyName: '杭州灵犀智能科技有限公司', referrerPhone: '13900000002' },
        { companyName: '深圳云图大数据科技有限公司', referrerPhone: '13900000002' },
        { companyName: '苏州纳米材料科技有限公司', referrerPhone: '13900000012' },
        { companyName: '广州智能驾驶科技有限公司', referrerPhone: '13900000012' },
        { companyName: '南京生物医药研究有限公司', referrerPhone: '13900000002' },
        { companyName: '上海商汤智算科技有限公司', referrerPhone: '13900000012' },
        { companyName: '北京星河航天科技有限公司', referrerPhone: '13900000002' },
        { companyName: '深圳优必选机器人有限公司', referrerPhone: '13900000012' },
        { companyName: '上海壁仞集成电路有限公司', referrerPhone: '13900000002' },
        { companyName: '杭州涂鸦智能科技有限公司', referrerPhone: '13900000012' },
    ];
    for (const rp of referralPairs) {
        const intakeId = intakeMap.get(rp.companyName);
        const referrer = userMap.get(rp.referrerPhone);
        if (!intakeId || !referrer)
            continue;
        const existing = await referralRepo.findOne({
            where: { intakeId, referrerId: referrer.id },
        });
        if (existing)
            continue;
        const ref = new referral_entity_1.Referral();
        ref.intakeId = intakeId;
        ref.referrer = { id: referrer.id };
        ref.type = 'referrer';
        await referralRepo.save(ref);
        refCount++;
    }
    console.log(`  Referrals created: ${refCount}`);
    console.log('\n=== Summary ===');
    const userCount = await userRepo.count();
    const intakeCount = await intakeRepo.count();
    const fuTotal = await followUpRepo.count();
    const visitTotal = await visitRepo.count();
    const refTotal = await referralRepo.count();
    console.log(`  Users: ${userCount}`);
    console.log(`  Intakes: ${intakeCount}`);
    console.log(`  Follow-ups: ${fuTotal}`);
    console.log(`  Visits: ${visitTotal}`);
    console.log(`  Referrals: ${refTotal}`);
    const statusCounts = await intakeRepo
        .createQueryBuilder('i')
        .select('i.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('i.status')
        .getRawMany();
    console.log('\n  Intake status distribution:');
    for (const s of statusCounts) {
        console.log(`    ${s.status}: ${s.count}`);
    }
    await dataSource.destroy();
    console.log('\nMock seed completed.');
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=mock-seed.js.map