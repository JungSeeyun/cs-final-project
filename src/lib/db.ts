import { Pool } from '@neondatabase/serverless';

declare global {
  var _pgPool: Pool | undefined;
}

const pool = globalThis._pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool;
}

export async function query(text: string, params?: unknown[]) {
  const result = await pool.query(text, params);
  return result;
}

export default pool;
