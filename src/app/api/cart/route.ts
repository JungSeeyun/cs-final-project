import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

function getUserId(req: NextRequest): number | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    return verifyToken(token).userId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: '인증 오류' }, { status: 401 });

  const result = await query(
    `SELECT ci.id, ci.quantity, mi.id as menu_item_id, mi.name, mi.price,
            mi.restaurant_id, r.name as restaurant_name
     FROM cart_items ci
     JOIN menu_items mi ON ci.menu_item_id = mi.id
     JOIN restaurants r ON mi.restaurant_id = r.id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at`,
    [userId]
  );
  return NextResponse.json({ cart: result.rows });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: '인증 오류' }, { status: 401 });

  const { menuItemId, quantity = 1 } = await req.json();

  const existing = await query(
    'SELECT id FROM cart_items WHERE user_id = $1 AND menu_item_id = $2',
    [userId, menuItemId]
  );

  if (existing.rows.length > 0) {
    await query(
      'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
      [quantity, existing.rows[0].id]
    );
  } else {
    await query(
      'INSERT INTO cart_items (user_id, menu_item_id, quantity) VALUES ($1, $2, $3)',
      [userId, menuItemId, quantity]
    );
  }

  return NextResponse.json({ message: '장바구니에 추가됐습니다' });
}

export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: '인증 오류' }, { status: 401 });

  const { cartItemId, clearAll } = await req.json();
  if (clearAll) {
    await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  } else {
    await query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [cartItemId, userId]);
  }
  return NextResponse.json({ message: '삭제됐습니다' });
}
