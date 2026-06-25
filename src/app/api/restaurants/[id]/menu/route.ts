import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [restaurantResult, menuResult, reviewResult] = await Promise.all([
    query(`
      SELECT r.*, ROUND(COALESCE(AVG(rv.rating), 0), 1) as avg_rating, COUNT(rv.id)::int as review_count
      FROM restaurants r
      LEFT JOIN reviews rv ON r.id = rv.restaurant_id
      WHERE r.id = $1
      GROUP BY r.id
    `, [id]),
    query('SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY id', [id]),
    query(`
      SELECT rv.*, u.name as user_name
      FROM reviews rv
      JOIN users u ON rv.user_id = u.id
      WHERE rv.restaurant_id = $1
      ORDER BY rv.created_at DESC
      LIMIT 20
    `, [id]),
  ]);

  if (restaurantResult.rows.length === 0) {
    return NextResponse.json({ error: '식당을 찾을 수 없습니다' }, { status: 404 });
  }

  return NextResponse.json({
    restaurant: restaurantResult.rows[0],
    menu: menuResult.rows,
    reviews: reviewResult.rows,
  });
}
