const Database = require('better-sqlite3');
const db = new Database('./data.db');

const u1 = db.prepare("UPDATE intakes SET applicationRegionId=4 WHERE companyName='珠海医药'").run();

const intakes = [
  { cn: '北京中关村科技', ari: 2, a: 600 },
  { cn: '北京海淀AI', ari: 13, a: 800 },
  { cn: '北京朝阳文化创意', ari: 12, a: 350 },
  { cn: '广州互联网', ari: 16, a: 1200 },
  { cn: '深圳新能源', ari: 17, a: 950 },
  { cn: '杭州直播电商', ari: 22, a: 700 },
];

const insert = db.prepare(`INSERT INTO intakes (companyName, creditCode, legalPerson, establishDate, industry, shareholders, applicationRegionId, area, status, applicantId, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);

intakes.forEach((i, idx) => {
  insert.run(
    i.cn,
    `91110000MA0${String(idx).padStart(7, '0')}A`,
    '测试法人',
    '2018-01-01',
    '科技',
    '测试股东 100%',
    i.ari,
    i.a,
    'pending',
    1,
    new Date().toISOString(),
    new Date().toISOString()
  );
});

const all = db.prepare(`SELECT i.id, i.companyName, i.applicationRegionId, i.area, r.name as regionName, r.parentId, r.level FROM intakes i LEFT JOIN regions r ON i.applicationRegionId=r.id WHERE i.applicationRegionId IS NOT NULL ORDER BY i.id`).all();
console.log(JSON.stringify(all, null, 2));

db.close();
