const Database = require('better-sqlite3');
const db = new Database('./data.db');

const r1 = db.prepare("UPDATE regions SET level=1 WHERE level='province'").run();
const r2 = db.prepare("UPDATE regions SET level=2 WHERE level='city'").run();
const r3 = db.prepare("UPDATE regions SET level=1 WHERE level='region'").run();
const r4 = db.prepare("UPDATE regions SET name='华东园区' WHERE id=1").run();

console.log('Updated province:', r1.changes, 'city:', r2.changes, 'region:', r3.changes, 'name:', r4.changes);
const rows = db.prepare('SELECT id, name, level, parentId FROM regions ORDER BY id').all();
console.log(JSON.stringify(rows, null, 2));

const intakes = db.prepare("SELECT id, companyName, applicationRegionId, area, status FROM intakes").all();
console.log('\nIntakes:', JSON.stringify(intakes, null, 2));

db.close();
