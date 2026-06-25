import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

function getUserId(req: NextRequest): number | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try { return verifyToken(token).userId; } catch { return null; }
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: '인증 오류' }, { status: 401 });

  const ordersResult = await query(
    `SELECT o.id, o.total_price, o.status, o.created_at,
            r.id as restaurant_id, r.name as restaurant_name, r.delivery_time
     FROM orders o
     JOIN restaurants r ON o.restaurant_id = r.id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [userId]
  );

  const orders = ordersResult.rows;
  if (orders.length === 0) return NextResponse.json({ orders: [] });

  const orderIds = orders.map(o => o.id);
  const itemsResult = await query(
    `SELECT oi.order_id, mi.name, oi.quantity, oi.price_at_order
     FROM order_items oi
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE oi.order_id = ANY($1)`,
    [orderIds]
  );

  const ordersWithItems = orders.map(order => ({
    ...order,
    items: itemsResult.rows.filter(item => item.order_id === order.id),
  }));

  return NextResponse.json({ orders: ordersWithItems });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: '인증 오류' }, { status: 401 });

  const cartResult = await query(
    `SELECT ci.id, ci.quantity, mi.id as menu_item_id, mi.price, mi.restaurant_id
     FROM cart_items ci
     JOIN menu_items mi ON ci.menu_item_id = mi.id
     WHERE ci.user_id = $1`,
    [userId]
  );

  const cart = cartResult.rows;
  if (cart.length === 0) return NextResponse.json({ error: '장바구니가 비어있습니다' }, { status: 400 });

  const restaurantId = cart[0].restaurant_id;
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderResult = await query(
    'INSERT INTO orders (user_id, restaurant_id, total_price, status) VALUES ($1, $2, $3, $4) RETURNING id',
    [userId, restaurantId, totalPrice, 'pending']
  );
  const orderId = orderResult.rows[0].id;

  for (const item of cart) {
    await query(
      'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_order) VALUES ($1, $2, $3, $4)',
      [orderId, item.menu_item_id, item.quantity, item.price]
    );
  }

  await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  return NextResponse.json({ message: '주문 완료!', orderId }, { status: 201 });
}
