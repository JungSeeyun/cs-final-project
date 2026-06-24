import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const raw = process.env.DATABASE_URL ?? 'NOT_SET';
    const result = await query('SELECT * FROM restaurants ORDER BY id');
    return NextResponse.json({ restaurants: result.rows });
  } catch (e) {
    const err = e as Error;
    const raw = process.env.DATABASE_URL ?? 'NOT_SET';
    let parsedHost = 'parse_error';
    try { parsedHost = new URL(raw).hostname; } catch {}
    return NextResponse.json({
      error: err.message,
      raw_len: raw.length,
      raw_start: raw.substring(0, 50),
      parsed_host: parsedHost,
    }, { status: 500 });
  }
}
