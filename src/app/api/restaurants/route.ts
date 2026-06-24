import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM restaurants ORDER BY id');
    return NextResponse.json({ restaurants: result.rows });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
