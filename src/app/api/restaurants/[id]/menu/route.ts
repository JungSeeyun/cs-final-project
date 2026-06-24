import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [restaurantResult, menuResult] = await Promise.all([
    query('SELECT * FROM restaurants WHERE id = $1', [id]),
    query('SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY id', [id]),
  ]);

  if (restaurantResult.rows.length === 0) {
    return NextResponse.json({ error: '식당을 찾을 수 없습니다' }, { status: 404 });
  }

  return NextResponse.json({
    restaurant: restaurantResult.rows[0],
    menu: menuResult.rows,
  });
}
