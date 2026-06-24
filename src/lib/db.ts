import { Pool } from 'pg';

declare global {
  var _pgPool: Pool | undefined;
}

const pool = globalThis._pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool;
}

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export default pool;
