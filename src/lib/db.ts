import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

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
  return pool.query(text, params);
}

export default pool;
