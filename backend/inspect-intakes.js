const Database = require('better-sqlite3');
const db = new Database('./data.db');

const cols = db.prepare("PRAGMA table_info(intakes)").all();
console.log('Columns:', JSON.stringify(cols.map(c => `${c.name}(${c.type})`), null, 2));

const sample = db.prepare("SELECT * FROM intakes LIMIT 1").get();
console.log('Sample:', JSON.stringify(sample, null, 2));

db.close();
