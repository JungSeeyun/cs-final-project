const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
p.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
  .then(r => console.log('테이블 목록:', r.rows.map(r => r.table_name)))
  .catch(e => console.error(e.message))
  .finally(() => p.end());
