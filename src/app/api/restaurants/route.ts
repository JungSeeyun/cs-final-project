import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const result = await query('SELECT * FROM restaurants ORDER BY id');
  return NextResponse.json({ restaurants: result.rows });
}
