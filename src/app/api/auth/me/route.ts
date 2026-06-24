import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ user: null });

  try {
    const { userId } = verifyToken(token);
    const result = await query('SELECT id, email, name FROM users WHERE id = $1', [userId]);
    return NextResponse.json({ user: result.rows[0] ?? null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
