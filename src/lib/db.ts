import { Pool } from 'pg';

declare global {
  var _pgPool: Pool | undefined;
}

// Remove sslmode/channel_binding from the URL so pg v8 doesn't override
// the explicit ssl option below (pg v8 treats sslmode=require as verify-full).
function getConnectionString() {
  // Remove BOM that PowerShell's UTF-8 Out-File adds to env vars stored via file pipes
  const raw = (process.env.DATABASE_URL ?? '').replace(/^﻿/, '');
  try {
    const url = new URL(raw);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('channel_binding');
    return url.toString();
  } catch {
    return raw;
  }
}

const pool = globalThis._pgPool ?? new Pool({
  connectionString: getConnectionString(),
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
