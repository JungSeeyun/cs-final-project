const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('✅ Neon DB 스키마 적용 완료!');
  await pool.end();
}

main().catch(err => { console.error('❌ 오류:', err.message); process.exit(1); });
