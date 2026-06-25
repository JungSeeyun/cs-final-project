import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const result = await query(`
    SELECT r.*, ROUND(COALESCE(AVG(rv.rating), 0), 1) as avg_rating, COUNT(rv.id)::int as review_count
    FROM restaurants r
    LEFT JOIN reviews rv ON r.id = rv.restaurant_id
    GROUP BY r.id
    ORDER BY r.id
  `);
  return NextResponse.json({ restaurants: result.rows });
}
