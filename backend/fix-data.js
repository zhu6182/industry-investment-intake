const Database = require('better-sqlite3');
const db = new Database('./data.db');

const update1 = db.prepare("UPDATE intakes SET applicationRegionId=3 WHERE companyName='上海智能科技'").run();
const update2 = db.prepare("UPDATE intakes SET applicationRegionId=3 WHERE companyName='上海云计算'").run();
const update3 = db.prepare("UPDATE intakes SET applicationRegionId=3 WHERE companyName='上海金融服务'").run();
const update4 = db.prepare("UPDATE intakes SET applicationRegionId=16 WHERE companyName='广州新能源'").run();
const update5 = db.prepare("UPDATE intakes SET applicationRegionId=17 WHERE companyName='深圳半导体'").run();
const update6 = db.prepare("UPDATE intakes SET applicationRegionId=18 WHERE companyName='佛山智能制造'").run();
const update7 = db.prepare("UPDATE intakes SET applicationRegionId=4 WHERE companyName='珠海医药'").run();
const update8 = db.prepare("UPDATE intakes SET applicationRegionId=19 WHERE companyName='南京人工智能'").run();
const update9 = db.prepare("UPDATE intakes SET applicationRegionId=20 WHERE companyName='苏州生物医药'").run();
const update10 = db.prepare("UPDATE intakes SET applicationRegionId=21 WHERE companyName='无锡物联网'").run();
const update11 = db.prepare("UPDATE intakes SET applicationRegionId=22 WHERE companyName='杭州电商'").run();
const update12 = db.prepare("UPDATE intakes SET applicationRegionId=23 WHERE companyName='宁波湾区型'").run();
const update13 = db.prepare("UPDATE intakes SET applicationRegionId=24 WHERE companyName='温州鞋鞋企业'").run();
const update14 = db.prepare("UPDATE intakes SET applicationRegionId=25 WHERE companyName='济南重工'").run();
const update15 = db.prepare("UPDATE intakes SET applicationRegionId=26 WHERE companyName='青岛海洋科技'").run();
const update16 = db.prepare("UPDATE intakes SET applicationRegionId=27 WHERE companyName='成都数字娱乐'").run();
const update17 = db.prepare("UPDATE intakes SET applicationRegionId=28 WHERE companyName='武汉光电'").run();
const update18 = db.prepare("UPDATE intakes SET applicationRegionId=29 WHERE companyName='福州轮能源'").run();
const update19 = db.prepare("UPDATE intakes SET applicationRegionId=30 WHERE companyName='郑州食品零售'").run();
const update20 = db.prepare("UPDATE intakes SET applicationRegionId=12 WHERE companyName='朝阳区企业'").run();

const intakes = db.prepare("SELECT i.id, i.companyName, i.applicationRegionId, i.area, r.name as regionName, r.parentId FROM intakes i LEFT JOIN regions r ON i.applicationRegionId=r.id WHERE i.applicationRegionId IS NOT NULL").all();
console.log(JSON.stringify(intakes, null, 2));

db.close();
